import logging
import random
import time
from typing import List, Dict, Optional
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("course-scraper")

# User-Agent rotation for anti-bot
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
]

# Field to search query mapping
FIELD_SEARCH_QUERIES = {
    "Software Engineering": ["software engineering", "programming", "coding"],
    "Frontend Development": ["frontend development", "react", "javascript", "web development"],
    "Backend Development": ["backend development", "nodejs", "python", "api"],
    "Data Science": ["data science", "machine learning", "data analysis"],
    "DevOps": ["devops", "docker", "kubernetes", "ci cd"],
    "Mobile Development": ["mobile development", "flutter", "react native", "android"],
    "Full Stack Development": ["full stack", "web development"],
    "Cybersecurity": ["cybersecurity", "ethical hacking", "security"],
}


def _get_headers() -> Dict[str, str]:
    """Get request headers with rotating User-Agent."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }


def _random_delay(min_s: float = 2.0, max_s: float = 5.0):
    """Random delay between requests to avoid rate limiting."""
    time.sleep(random.uniform(min_s, max_s))


def scrape_coursera(query: str, max_results: int = 10) -> List[Dict]:
    """
    Scrape Coursera course search results.
    Uses Coursera's public search page.
    """
    courses = []
    try:
        url = f"https://www.coursera.org/search?query={quote_plus(query)}"
        _random_delay()
        resp = requests.get(url, headers=_get_headers(), timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select(".cds-ProductCard-gridCard")

        for card in cards[:max_results]:
            # Find course link
            link_el = card.select_one("a[href*='/learn/'], a[href*='/specializations/'], a[href*='/professional-certificates/']")
            if not link_el:
                continue

            href = link_el.get("href", "")
            title = link_el.get_text(strip=True)

            # Find provider/instructor
            provider = ""
            provider_el = card.select_one("[data-testid='product-card-by']")
            if provider_el:
                provider = provider_el.get_text(strip=True).replace("By ", "")

            # Find price/status
            price = "Free Trial"
            price_el = card.select_one("[data-testid='price']")
            if price_el:
                price = price_el.get_text(strip=True)

            # Find skills
            skills = ""
            skills_el = card.select_one("[data-testid='skills']")
            if skills_el:
                skills = skills_el.get_text(strip=True)

            if title and href:
                full_url = f"https://www.coursera.org{href}" if not href.startswith("http") else href
                courses.append({
                    "course_name": title,
                    "course_url": full_url,
                    "description": skills[:500] if skills else "",
                    "instructor": provider,
                    "rating": 0,
                    "duration": "",
                    "price": price,
                    "platform": "coursera",
                    "enrollment_count": 0,
                })

        logger.info(f"Coursera: scraped {len(courses)} courses for '{query}'")
    except requests.RequestException as e:
        logger.warning(f"Coursera scrape failed for '{query}': {e}")
    except Exception as e:
        logger.error(f"Coursera parse error for '{query}': {e}")

    return courses


def scrape_courses_for_field(field: str, max_per_platform: int = 10) -> List[Dict]:
    """
    Scrape courses from Coursera for a given field.
    Udemy blocks scraping, so we use the static COURSE_MAP for Udemy courses.
    Returns combined list of courses.
    """
    from api.courses import COURSE_MAP

    queries = FIELD_SEARCH_QUERIES.get(field, [field])
    all_courses = []
    seen_urls = set()

    # Add static Udemy courses from COURSE_MAP
    static_courses = COURSE_MAP.get(field, [])
    for course_data in static_courses:
        if len(course_data) == 2:
            name, url = course_data
            if url not in seen_urls:
                seen_urls.add(url)
                platform = "udemy" if "udemy.com" in url else "coursera" if "coursera.org" in url else "other"
                all_courses.append({
                    "course_name": name,
                    "course_url": url,
                    "description": "",
                    "instructor": "",
                    "rating": 0,
                    "duration": "",
                    "price": "Unknown",
                    "platform": platform,
                    "enrollment_count": 0,
                })

    # Scrape Coursera for additional courses
    for query in queries[:2]:
        try:
            coursera_courses = scrape_coursera(query, max_per_platform)
            for course in coursera_courses:
                url = course["course_url"]
                if url not in seen_urls:
                    seen_urls.add(url)
                    all_courses.append(course)
        except Exception as e:
            logger.error(f"Coursera scraping error for '{query}': {e}")

    logger.info(f"Total courses for '{field}': {len(all_courses)} (static + scraped)")
    return all_courses
