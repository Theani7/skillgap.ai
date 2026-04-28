import sqlite3
import os
from contextlib import contextmanager

DB_FILE = os.getenv("DB_FILE", os.path.join(os.path.dirname(os.path.dirname(__file__)), "cv.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    """Context manager for database connections with automatic cleanup."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_data (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                sec_token varchar(20) NOT NULL,
                ip_add varchar(50) NULL,
                host_name varchar(50) NULL,
                dev_user varchar(50) NULL,
                os_name_ver varchar(50) NULL,
                latlong varchar(50) NULL,
                city varchar(50) NULL,
                state varchar(50) NULL,
                country varchar(50) NULL,
                act_name varchar(50) NOT NULL,
                act_mail varchar(50) NOT NULL,
                act_mob varchar(20) NOT NULL,
                Name varchar(500) NOT NULL,
                Email_ID VARCHAR(500) NOT NULL,
                resume_score VARCHAR(8) NOT NULL,
                Timestamp VARCHAR(50) NOT NULL,
                Page_no VARCHAR(5) NOT NULL,
                Predicted_Field BLOB NOT NULL,
                User_level BLOB NOT NULL,
                Actual_skills BLOB NOT NULL,
                Recommended_skills BLOB NOT NULL,
                Recommended_courses BLOB NOT NULL,
                pdf_name varchar(50) NOT NULL,
                target_role VARCHAR(200) DEFAULT 'Unknown',
                missing_skills TEXT DEFAULT '',
                user_id INTEGER DEFAULT -1,
                analysis_data TEXT DEFAULT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_feedback (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                feed_name varchar(50) NOT NULL,
                feed_email VARCHAR(50) NOT NULL,
                feed_score VARCHAR(5) NOT NULL,
                comments VARCHAR(100) NULL,
                Timestamp VARCHAR(50) NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                field VARCHAR(100) NOT NULL,
                course_name VARCHAR(300) NOT NULL,
                course_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                full_name VARCHAR(100) DEFAULT 'User',
                hashed_password VARCHAR(255) NOT NULL,
                role text NOT NULL CHECK(role IN ('admin', 'user'))
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_trends_cache (
                field VARCHAR(200) PRIMARY KEY,
                source VARCHAR(40) NOT NULL,
                payload TEXT NOT NULL,
                fetched_at INTEGER NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                token VARCHAR(1200) PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token VARCHAR(128) PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS job_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                company VARCHAR(200) NOT NULL,
                role VARCHAR(200) NOT NULL,
                status VARCHAR(40) NOT NULL DEFAULT 'applied',
                follow_up_date VARCHAR(30) DEFAULT NULL,
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY,
                full_name VARCHAR(200) DEFAULT '',
                phone VARCHAR(50) DEFAULT '',
                location VARCHAR(200) DEFAULT '',
                bio TEXT DEFAULT '',
                current_role VARCHAR(100) DEFAULT '',
                experience_years VARCHAR(10) DEFAULT '',
                linkedin_url VARCHAR(500) DEFAULT '',
                github_url VARCHAR(500) DEFAULT '',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id INTEGER PRIMARY KEY,
                target_role VARCHAR(200) DEFAULT '',
                timeline_months INTEGER DEFAULT 6,
                preferred_location VARCHAR(120) DEFAULT '',
                salary_target INTEGER DEFAULT 0,
                locale VARCHAR(20) DEFAULT 'en',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shared_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token VARCHAR(80) UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                analysis_id INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                is_public INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                channel VARCHAR(30) NOT NULL DEFAULT 'email',
                message TEXT NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'pending',
                send_at INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                user_id INTEGER PRIMARY KEY,
                plan VARCHAR(40) NOT NULL DEFAULT 'free',
                status VARCHAR(30) NOT NULL DEFAULT 'active',
                renews_at INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS request_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id VARCHAR(80) NOT NULL,
                method VARCHAR(10) NOT NULL,
                path VARCHAR(300) NOT NULL,
                status_code INTEGER NOT NULL,
                elapsed_ms REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        if cursor.fetchone() is None:
            from api.auth import get_password_hash
            default_hashed = get_password_hash("admin123")
            cursor.execute('''
                INSERT INTO users (username, email, full_name, hashed_password, role)
                VALUES (?, ?, ?, ?, ?)
            ''', ("admin", "admin@analyzer.com", "System Admin", default_hashed, "admin"))
        
        conn.commit()

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_timestamp ON user_data(Timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_predicted_field ON user_data(Predicted_Field)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)")
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

init_db()
