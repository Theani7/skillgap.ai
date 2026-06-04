# Comprehensive taxonomy of technical and soft skills across multiple domains

SKILLS_TAXONOMY = {
    "Programming Languages": [
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "ruby", "go", "rust", 
        "swift", "kotlin", "php", "perl", "r", "scala", "dart", "objective-c", "shell", "powershell"
    ],
    "Web Frameworks": [
        "react", "angular", "vue", "svelte", "next.js", "nuxt.js", "django", "flask", "fastapi", 
        "spring boot", "express", "laravel", "ruby on rails", "asp.net", "jquery", "bootstrap", "tailwind"
    ],
    "Databases": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "oracle", "cassandra", "dynamodb", 
        "sqlite", "mariadb", "firebase", "elasticsearch", "neo4j"
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", 
        "terraform", "prometheus", "grafana", "nginx", "linux", "unix", "git", "github", "gitlab"
    ],
    "Data Science & AI": [
        "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", 
        "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "tableau", "power bi", "statistics"
    ],
    "Mobile Development": [
        "react native", "flutter", "ios", "android", "xamarin", "ionic", "swiftui", "jetpack compose"
    ],
    "Soft Skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking", 
        "time management", "adaptability", "mentoring", "public speaking", "project management"
    ],
    "Other Technical": [
        "rest api", "graphql", "microservices", "agile", "scrum", "kanban", "testing", "qa", 
        "unit testing", "integration testing", "security", "blockchain", "iot"
    ]
}

# Flatten for quick lookup
ALL_SKILLS = [skill for category in SKILLS_TAXONOMY.values() for skill in category]
