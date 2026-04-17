# Expanded Courses & Fields for recommendations

# Existing Data Science
ds_course = [
    ['Machine Learning Crash Course by Google [Free]', 'https://developers.google.com/machine-learning/crash-course'],
    ['Machine Learning A-Z by Udemy','https://www.udemy.com/course/machinelearning/'],
    ['Machine Learning by Andrew NG','https://www.coursera.org/learn/machine-learning']
]

# Existing Web Dev
web_course = [
    ['Django Crash course [Free]','https://youtu.be/e1IyzVyrLSU'],
    ['Python and Django Full Stack Web Developer Bootcamp','https://www.udemy.com/course/python-and-django-full-stack-web-developer-bootcamp'],
    ['React Crash Course [Free]','https://youtu.be/Dorf8i6lCuk']
]

# Existing Android
android_course = [
    ['Android Development for Beginners [Free]','https://youtu.be/fis26HvvDII'],
    ['Android App Development Specialization','https://www.coursera.org/specializations/android-app-development'],
    ['Associate Android Developer Certification','https://grow.google/androiddev/#?modal_active=none']
]

# Existing iOS
ios_course = [
    ['IOS App Development by LinkedIn','https://www.linkedin.com/learning/subscription/topics/ios'],
    ['iOS & Swift - The Complete iOS App Development Bootcamp','https://www.udemy.com/course/ios-13-app-development-bootcamp/'],
    ['Become an iOS Developer','https://www.udacity.com/course/ios-developer-nanodegree--nd003']
]

# Existing UI/UX
uiux_course = [
    ['Google UX Design Professional Certificate','https://www.coursera.org/professional-certificates/google-ux-design'],
    ['UI / UX Design Specialization','https://www.coursera.org/specializations/ui-ux-design'],
    ['The Complete App Design Course - UX, UI and Design Thinking','https://www.udemy.com/course/the-complete-app-design-course-ux-and-ui-design/']
]

# NEW Quality Assurance (QA)
qa_course = [
    ['Software Testing Tutorial For Beginners [Free]', 'https://www.youtube.com/watch?v=CV_osAENHhE'],
    ['Selenium WebDriver with Java - Basics to Advanced', 'https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/'],
    ['Postman: The Complete Guide - REST API Testing', 'https://www.udemy.com/course/postman-the-complete-guide/']
]

# NEW DevOps
devops_course = [
    ['DevOps Tutorial for Beginners [Free]', 'https://www.youtube.com/watch?v=hQcFE0RD0cQ'],
    ['Docker & Kubernetes: The Practical Guide', 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/'],
    ['Learn DevOps: The Complete Kubernetes Course', 'https://www.udemy.com/course/learn-devops-the-complete-kubernetes-course/']
]

COURSE_MAP = {
    'Data Science': ds_course,
    'Web Development': web_course,
    'Android Development': android_course,
    'IOS Development': ios_course,
    'UI-UX Development': uiux_course,
    'Quality Assurance': qa_course,
    'DevOps': devops_course
}

# NEW: Skill Roadmaps
ROADMAPS = {
    'Data Science': [
        {'step': 1, 'title': 'Programming & Math Foundations', 'duration': '3-4 weeks', 'skills': ['Python', 'Statistics', 'Linear Algebra']},
        {'step': 2, 'title': 'Data Manipulation & Analysis', 'duration': '4 weeks', 'skills': ['SQL', 'Pandas', 'NumPy']},
        {'step': 3, 'title': 'Machine Learning Core', 'duration': '6 weeks', 'skills': ['Scikit-Learn', 'Regression', 'Classification']},
        {'step': 4, 'title': 'Advanced Topics & Deployment', 'duration': 'Ongoing', 'skills': ['Deep Learning', 'NLP', 'Model Deployment']}
    ],
    'Web Development': [
        {'step': 1, 'title': 'Frontend Fundamentals', 'duration': '3 weeks', 'skills': ['HTML', 'CSS', 'JavaScript Basics']},
        {'step': 2, 'title': 'Advanced Frontend & Frameworks', 'duration': '5 weeks', 'skills': ['React', 'Next.js', 'State Management']},
        {'step': 3, 'title': 'Backend & APIs', 'duration': '4 weeks', 'skills': ['Node.js', 'Express', 'REST APIs', 'Databases']},
        {'step': 4, 'title': 'Full Stack Integration', 'duration': 'Ongoing', 'skills': ['Cloud Hosting', 'Authentication', 'System UI']}
    ],
    'Android Development': [
        {'step': 1, 'title': 'Language Basics', 'duration': '3 weeks', 'skills': ['Java', 'Kotlin Fundamentals']},
        {'step': 2, 'title': 'Android UI & Ecosystem', 'duration': '4 weeks', 'skills': ['Android Studio', 'XML', 'Jetpack Compose']},
        {'step': 3, 'title': 'Data & Architecture', 'duration': '5 weeks', 'skills': ['Room DB', 'MVVM', 'Coroutines', 'Retrofit']},
        {'step': 4, 'title': 'Advanced Production', 'duration': 'Ongoing', 'skills': ['Dependency Injection', 'Testing', 'Play Store Publishing']}
    ],
    'IOS Development': [
        {'step': 1, 'title': 'Language Basics', 'duration': '3 weeks', 'skills': ['Swift Fundamentals', 'Playgrounds']},
        {'step': 2, 'title': 'UI Engineering', 'duration': '5 weeks', 'skills': ['SwiftUI', 'UIKit', 'AutoLayout']},
        {'step': 3, 'title': 'Data & Network', 'duration': '4 weeks', 'skills': ['CoreData', 'URLSession', 'JSON Parsing']},
        {'step': 4, 'title': 'Advanced iOS', 'duration': 'Ongoing', 'skills': ['Combine', 'App Store Connect', 'Performance']}
    ],
    'UI-UX Development': [
        {'step': 1, 'title': 'Design Fundamentals', 'duration': '2 weeks', 'skills': ['Color Theory', 'Typography', 'Layout']},
        {'step': 2, 'title': 'UX Research & Wireframing', 'duration': '4 weeks', 'skills': ['User Personas', 'Journey Mapping', 'Balsamiq', 'Sketch']},
        {'step': 3, 'title': 'High-Fidelity Prototyping', 'duration': '4 weeks', 'skills': ['Figma', 'Adobe XD', 'Interaction Design']},
        {'step': 4, 'title': 'Testing & Handoff', 'duration': 'Ongoing', 'skills': ['Usability Testing', 'Design Systems', 'Developer Handoff']}
    ],
    'Quality Assurance': [
        {'step': 1, 'title': 'Manual Testing Basics', 'duration': '3 weeks', 'skills': ['Test Cases', 'Bug Lifecycles', 'Agile/Scrum']},
        {'step': 2, 'title': 'API & Postman', 'duration': '3 weeks', 'skills': ['REST APIs', 'Postman', 'JSON']},
        {'step': 3, 'title': 'Test Automation Core', 'duration': '6 weeks', 'skills': ['Programming Language (Java/Python)', 'Selenium', 'Playwright']},
        {'step': 4, 'title': 'Advanced CI/CD', 'duration': 'Ongoing', 'skills': ['Jenkins', 'GitHub Actions', 'Performance Testing']}
    ],
    'DevOps': [
        {'step': 1, 'title': 'OS & Scripting', 'duration': '3 weeks', 'skills': ['Linux', 'Bash Scripting', 'Networking Basics']},
        {'step': 2, 'title': 'Cloud & Containerization', 'duration': '5 weeks', 'skills': ['Docker', 'AWS/Azure', 'Virtualization']},
        {'step': 3, 'title': 'CI/CD & Orchestration', 'duration': '5 weeks', 'skills': ['Kubernetes', 'Jenkins', 'Git Pipelines']},
        {'step': 4, 'title': 'Infrastructure as Code', 'duration': 'Ongoing', 'skills': ['Terraform', 'Ansible', 'Monitoring (Grafana)']}
    ],
    'General': [
        {'step': 1, 'title': 'Core Soft Skills', 'duration': '2 weeks', 'skills': ['Communication', 'Time Management', 'Problem Solving']},
        {'step': 2, 'title': 'Digital Literacy', 'duration': '3 weeks', 'skills': ['Office Suites', 'Basic Troubleshooting', 'Collaboration Tools']},
        {'step': 3, 'title': 'Industry Specific Tech', 'duration': 'Varies', 'skills': ['CRM', 'ERP', 'Specialized Software']},
        {'step': 4, 'title': 'Leadership & Growth', 'duration': 'Ongoing', 'skills': ['Project Management', 'Agile Basics', 'Public Speaking']}
    ]
}

SKILL_RECOMMENDATIONS = {
    'Data Science': ['Python', 'Machine Learning', 'Data Visualization', 'Pandas', 'NumPy', 'SQL', 'Predictive Analysis', 'Statistical Modeling', 'Spark', 'Hadoop'],
    'Web Development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node JS', 'Django', 'Next.js', 'Typescript', 'GraphQL'],
    'Android Development': ['Kotlin', 'Android Architecture Components', 'RxJava', 'Coroutines', 'Dagger/Hilt', 'Jetpack Compose'],
    'IOS Development': ['Swift', 'SwiftUI', 'CoreData', 'Combine', 'RxSwift'],
    'UI-UX Development': ['UI/UX Design', 'Figma', 'Adobe XD', 'Adobe Illustrator', 'Adobe Photoshop', 'Interaction Design', 'Usability Testing', 'Information Architecture'],
    'Quality Assurance': ['Test Automation', 'API Testing', 'Performance Testing', 'CI/CD Integration', 'Selenium', 'Playwright'],
    'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Infrastructure as Code', 'Containerization', 'Monitoring (Prometheus/Grafana)', 'Cloud Architecture']
}

# Target keywords for each role instead of full embeddings, mapped to a weight (1-5)
# 5 = highly specific, 1 = generic
FIELD_KEYWORDS = {
    'Data Science': {
        'machine learning': 5, 'artificial intelligence': 5, 'deep learning': 5, 'neural networks': 5,
        'tensorflow': 5, 'pytorch': 5, 'keras': 5, 'nlp': 5, 'computer vision': 5,
        'pandas': 4, 'numpy': 4, 'scikit-learn': 4, 'scipy': 4, 'matplotlib': 4, 'seaborn': 4,
        'statistics': 3, 'predictive modeling': 4, 'data visualization': 3, 'data analysis': 3,
        'python': 2, 'sql': 2, 'r': 3, 'ml': 5, 'ai': 5, 'data scientist': 5, 'data engineer': 4
    },
    'Web Development': {
        'web development': 5, 'full stack': 5, 'frontend': 5, 'backend': 5, 'web developer': 5,
        'react': 5, 'angular': 5, 'vue': 5, 'next.js': 5, 'svelte': 5,
        'django': 5, 'node.js': 5, 'express.js': 5, 'spring boot': 4, 'laravel': 4,
        'javascript': 4, 'typescript': 4, 'html': 2, 'css': 2, 'sass': 3, 'tailwind': 4,
        'api': 3, 'restful': 3, 'graphql': 4, 'php': 3, 'ruby on rails': 4
    },
    'Android Development': {
        'android': 5, 'android studio': 5, 'android development': 5, 'android developer': 5,
        'kotlin': 5, 'jetpack compose': 5, 'dagger': 4, 'hilt': 4, 'rxjava': 4, 'coroutines': 4,
        'java': 2, 'mobile ui': 3, 'mobile app': 3, 'flutter': 4, 'react native': 3,
        'xml': 2, 'gradle': 3, 'sqlite': 2, 'room database': 4
    },
    'IOS Development': {
        'ios': 5, 'swift': 5, 'objective-c': 5, 'xcode': 5, 'cocoa touch': 5, 'ios developer': 5,
        'iphone': 4, 'apple': 3, 'swiftui': 5, 'coredata': 4, 'combine': 4, 'rxswift': 4,
        'mobile app': 3, 'flutter': 3, 'react native': 3, 'uikit': 4, 'testflight': 4
    },
    'UI-UX Development': {
        'ui/ux': 5, 'user interface': 5, 'user experience': 5, 'uiux': 5, 'ui designer': 5, 'ux designer': 5,
        'wireframing': 5, 'prototyping': 5, 'interaction design': 5, 'information architecture': 5,
        'figma': 5, 'adobe xd': 5, 'sketch': 5, 'invision': 4, 'balsamiq': 4,
        'visual design': 4, 'usability testing': 4, 'user research': 4, 'mockups': 4,
        'adobe illustrator': 3, 'photoshop': 2
    },
    'Quality Assurance': {
        'quality assurance': 5, 'qa': 5, 'test automation': 5, 'manual testing': 5, 'software testing': 5,
        'selenium': 5, 'cypress': 5, 'playwright': 5, 'appium': 5, 'qa engineer': 5,
        'jest': 4, 'junit': 4, 'testng': 4, 'mocha': 4, 'chai': 4,
        'test cases': 4, 'bug tracking': 3, 'jira': 2, 'postman': 4, 'api testing': 4,
        'performance testing': 4, 'load testing': 4
    },
    'DevOps': {
        'devops': 5, 'site reliability': 5, 'sre': 5, 'infrastructure as code': 5, 'devops engineer': 5,
        'kubernetes': 5, 'docker': 5, 'containerization': 5, 'orchestration': 4,
        'ci/cd': 5, 'continuous integration': 5, 'jenkins': 5, 'gitlab ci': 4, 'github actions': 4,
        'aws': 4, 'azure': 4, 'gcp': 4, 'cloud architecture': 4, 'terraform': 5, 'ansible': 5,
        'prometheus': 4, 'grafana': 4, 'linux': 3, 'bash': 3, 'shell scripting': 3
    }
}

def predict_field_with_ai(resume_data: dict) -> str:
    """
    Takes the full parsed resume dictionary, and uses a weighted keyword 
    matching algorithm against skills, objective, and designation to find 
    the closest matching professional field.
    """
    # Defensive check
    if not resume_data:
        return "Unknown"
        
    scores = {field: 0 for field in FIELD_KEYWORDS.keys()}
    
    # Extract readable text fields
    skills = resume_data.get('skills', []) or []
    designation = resume_data.get('designation', []) or []
    objective = resume_data.get('objective', '') or ''
    
    # Normalize inputs
    user_skills_lower = [str(s).lower().strip() for s in skills]
    user_desig_lower = [str(d).lower().strip() for d in designation]
    objective_lower = str(objective).lower()
    
    for field, keyword_weights in FIELD_KEYWORDS.items():
        for kw, weight in keyword_weights.items():
            kw = kw.lower()
            
            # --- 1. HIGHEST PRIORITY: Designation (Job Title) ---
            # If a user literally has the job title (e.g., "Data Scientist"), heavily favor it.
            if any(kw in d or d in kw for d in user_desig_lower):
                scores[field] += (weight * 3) # Triple weight for job titles
                
            # --- 2. HIGH PRIORITY: Exact Skill Matches ---
            # If "Machine Learning" exactly matches a skill in the list
            if kw in user_skills_lower:
                scores[field] += (weight * 2) # Double weight for exact skill match
            else:
                # --- 3. MEDIUM PRIORITY: Partial Skill Matches ---
                # e.g., skill is "Advanced React JS" and keyword is "React"
                if any(kw in s for s in user_skills_lower):
                    scores[field] += weight
                    
            # --- 4. LOWER PRIORITY: Objective/Summary Text ---
            # Look for the keyword organically in the objective paragraph
            if kw in objective_lower:
                scores[field] += weight
                
    # Find the field with the highest score
    best_field = max(scores, key=scores.get)
    best_score = scores[best_field]
    
    # Threshold: If their score is basically 0, we can't classify them
    if best_score < 3:
        return "Unknown"
        
    return best_field

# Dynamic Video Dictionaries mapped to Predicted Fields
# We keep a "General" fallback for Unknown fields, and specific ones for others.
RESUME_VIDEOS = {
    'General': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/y8YH0Qbu5h4', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/BYUy1yvjHxE'],
    'Data Science': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/1mHjMNZZvFo'], # Added a DS specific resume guide example
    'Web Development': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/pZQcIuT02A8'], # Added a SW Eng specific resume guide
    'Android Development': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/pZQcIuT02A8'],
    'IOS Development': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/pZQcIuT02A8'],
    'UI-UX Development': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/1mHjMNZZvFo'],
    'Quality Assurance': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/1mHjMNZZvFo'],
    'DevOps': ['https://youtu.be/Tt08KmFfIYQ', 'https://youtu.be/u75hUSShvnc', 'https://youtu.be/pZQcIuT02A8'],
}

INTERVIEW_VIDEOS = {
    'General': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/KukmClH1KoA', 'https://youtu.be/7_aAicmPB3A'],
    'Data Science': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/1mHjMNZZvFo', 'https://youtu.be/xGptVDqE3f0'], # Data Science Interview specific
    'Web Development': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/KukmClH1KoA', 'https://youtu.be/pZQcIuT02A8'],
    'Android Development': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/1mHjMNZZvFo', 'https://youtu.be/xGptVDqE3f0'],
    'IOS Development': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/1mHjMNZZvFo', 'https://youtu.be/xGptVDqE3f0'],
    'UI-UX Development': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/KukmClH1KoA', 'https://youtu.be/pZQcIuT02A8'],
    'Quality Assurance': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/KukmClH1KoA', 'https://youtu.be/pZQcIuT02A8'],
    'DevOps': ['https://youtu.be/HG68Ymazo18', 'https://youtu.be/BOvAAoxM4vg', 'https://youtu.be/1mHjMNZZvFo', 'https://youtu.be/xGptVDqE3f0'],
}

SKILL_TUTORIAL_VIDEOS = {
    'python': 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    'machine learning': 'https://www.youtube.com/watch?v=7eh4d6sabA0',
    'ui/ux': 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
    'ui-ux design': 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
    'adobe illustrator': 'https://www.youtube.com/watch?v=Ib8UBwu3y2I',
    'adobe photoshop': 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
    'adobe xd': 'https://www.youtube.com/watch?v=WEMkVumGWzI',
    'figma': 'https://www.youtube.com/watch?v=jwNmEbBcgN4',
    'css': 'https://www.youtube.com/watch?v=OXGznpKZ_sA',
    'html': 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
    'javascript': 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    'react': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    'node js': 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
    'sql': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    'docker': 'https://www.youtube.com/watch?v=pTFZFxd4hOI',
    'kubernetes': 'https://www.youtube.com/watch?v=X48VuDVv0do',
    'aws': 'https://www.youtube.com/watch?v=k1RI5locZE4',
    'pandas': 'https://www.youtube.com/watch?v=vmEHCJofslg',
    'numpy': 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
    'django': 'https://www.youtube.com/watch?v=F5mRW0jo-U4',
    'android': 'https://www.youtube.com/watch?v=fis26HvvDII',
    'kotlin': 'https://www.youtube.com/watch?v=F9UC9n1ARrc',
    'swift': 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
    'ios': 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
}

import urllib.parse

def generate_youtube_search_links(skills: list) -> list:
    """
    Takes a list of recommended skills and generates exact video links if available,
    otherwise generates direct YouTube search query links.
    """
    links = []
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower in SKILL_TUTORIAL_VIDEOS:
            url = SKILL_TUTORIAL_VIDEOS[skill_lower]
            links.append({'title': f"Learn {skill}", 'url': url})
        else:
            query = urllib.parse.quote(f"{skill} tutorial for beginners")
            url = f"https://www.youtube.com/results?search_query={query}"
            links.append({'title': f"Learn {skill}", 'url': url})
    return links
