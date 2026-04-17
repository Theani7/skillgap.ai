# Project Synopsis: SkillGap.ai (AI-Powered Resume Analyzer & Career Coach)

## 1. Introduction
In today's highly competitive job market, candidates often struggle to align their resumes with the rapidly evolving demands of the tech industry. **SkillGap.ai** is an intelligent, full-stack SaaS platform designed to bridge this gap. By leveraging advanced Natural Language Processing (NLP) and Generative AI (Google Gemini), the platform transforms the traditional, static resume review process into a dynamic, data-driven career coaching experience.

## 2. Problem Statement
Job seekers frequently face rejection due to a lack of specific keywords, suboptimal formatting, or missing critical skills required for their target roles. Furthermore, generic career advice fails to address the unique background of each individual. There is a critical need for an automated system that can objectively evaluate a candidate's current profile against real-time market demands and provide actionable, personalized steps for improvement.

## 3. Proposed Solution
SkillGap.ai acts as an autonomous career coach. It parses user-uploaded resumes (PDF/DOCX), evaluates them against specific industry roles, and generates a personalized "Resume Score." More importantly, the system identifies crucial missing skills and utilizes Generative AI to generate a highly personalized, phase-by-phase learning roadmap, empowering the user to upskill efficiently.

## 4. Key Features & Capabilities
*   **Intelligent Multi-Format Parsing:** Seamlessly extracts text, skills, and metadata from PDF and DOCX documents.
*   **Target Role Evaluation & Match Scoring:** Evaluates the candidate's profile specifically against the standards of their chosen industry (e.g., Data Science, Web Development, QA), generating an objective Match Score.
*   **Dynamic AI Coaching Roadmaps:** Replaces static career paths with 4-phase chronological learning curriculums generated on-the-fly by Google Gemini, tailored specifically to close the user's skill gaps.
*   **Advanced Industry Analytics (Matrix V2):** A stunning 4-grid interactive dashboard providing live data insights, including job demand projections, highest-paying skills, workplace environment splits (Remote/Hybrid/Onsite), and regional salary hubs.
*   **User Dashboard & History Tracking:** Authenticated users can track their Resume Score progression over time (via Recharts area graphs) and interact with a historical ledger to replay past AI analyses and roadmaps.
*   **Simulated Market Scraper:** An admin-controlled feature that simulates real-time shifts in tech industry demands, dynamically altering the global dictionary of required skills to prove the AI's adaptability.
*   **Admin Command Center:** A secure portal for administrators to monitor platform health, track macro-trends (e.g., *Most Sought-After Role*, *Top Missing Skill*), and review user feedback.

## 5. Technology Stack
*   **Frontend (Client-Side):** React.js (Vite), React Router DOM, Recharts (Data Visualization), Framer Motion (Animations), Vanilla CSS (Glassmorphic Design).
*   **Backend (Server-Side):** FastAPI (Python), Google Gemini 2.5 LLM Pro SDK (AI Generation).
*   **Database:** SQLite3 (Lightweight, relational data storage).
*   **Authentication & Security:** JWT (JSON Web Tokens), `passlib` (Password Hashing).
*   **Document Processing:** `PyMuPDF` (PDFs), `python-docx` (Word Documents).

## 6. Future Scope
While currently focused on the tech industry, SkillGap.ai's architecture is highly scalable. Future enhancements could include:
*   Integration with live job boards (e.g., LinkedIn, Indeed) via official APIs for real-time market scraping.
*   Automated Cover Letter generation tailored to specific job descriptions.
*   Mock Interview simulation using AI voice avatars based on the candidate's discovered weaknesses.
*   Expansion into non-tech industries (Healthcare, Finance, Engineering).

## 7. Conclusion
SkillGap.ai represents a significant step forward in automated career development. By combining the analytical power of FastAPI with the generative capabilities of Google Gemini and the interactive visual experience of React, the platform provides unparalleled, personalized guidance to help candidates navigate and conquer the modern job market.
