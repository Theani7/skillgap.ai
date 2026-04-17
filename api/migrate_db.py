import sqlite3
import os
import json
from api.courses import COURSE_MAP

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cv.db")

def migrate():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Add target_role and missing_skills to user_data
    try:
        cursor.execute("ALTER TABLE user_data ADD COLUMN target_role VARCHAR(200) DEFAULT 'Unknown'")
        print("Added 'target_role' to user_data.")
    except sqlite3.OperationalError as e:
        print(f"Column 'target_role' might already exist: {e}")
        
    try:
        cursor.execute("ALTER TABLE user_data ADD COLUMN missing_skills TEXT DEFAULT ''")
        print("Added 'missing_skills' to user_data.")
    except sqlite3.OperationalError as e:
        print(f"Column 'missing_skills' might already exist: {e}")

    # 2. Create courses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field VARCHAR(100) NOT NULL,
            course_name VARCHAR(300) NOT NULL,
            course_url VARCHAR(500) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("Created 'courses' table.")
    
    # 3. Migrate static courses from COURSE_MAP to DB if table is empty
    cursor.execute("SELECT COUNT(*) FROM courses")
    if cursor.fetchone()[0] == 0:
        print("Migrating static courses to the database...")
        for field, courses in COURSE_MAP.items():
            for course_details in courses:
                if len(course_details) >= 2:
                    name, url = course_details[0], course_details[1]
                    cursor.execute("INSERT INTO courses (field, course_name, course_url) VALUES (?, ?, ?)", (field, name, url))
        print("Static courses migrated successfully.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
