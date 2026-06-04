import sqlite3
import os
import time
from contextlib import contextmanager
from sqlalchemy import create_engine, event

DB_FILE = os.getenv("DB_FILE") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "cv.db"
)

engine = create_engine(
    f"sqlite:///{DB_FILE}",
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()
    dbapi_connection.row_factory = sqlite3.Row


def get_db_connection():
    return engine.raw_connection()


@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def _ensure_column(cursor, table: str, col: str, typedef: str) -> None:
    cursor.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cursor.fetchall()}
    if col not in existing:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {typedef}")


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
                act_name varchar(255) NOT NULL DEFAULT '',
                act_mail varchar(255) NOT NULL DEFAULT '',
                act_mob varchar(50) NOT NULL DEFAULT '',
                Name varchar(500) NOT NULL,
                Email_ID VARCHAR(500) NOT NULL,
                resume_score VARCHAR(8) NOT NULL,
                Timestamp VARCHAR(50) NOT NULL,
                Page_no VARCHAR(5) NOT NULL,
                Predicted_Field TEXT NOT NULL DEFAULT '',
                User_level TEXT NOT NULL DEFAULT '',
                Actual_skills TEXT NOT NULL DEFAULT '',
                Recommended_skills TEXT NOT NULL DEFAULT '',
                Recommended_courses TEXT NOT NULL DEFAULT '',
                pdf_name varchar(255) NOT NULL,
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
                feed_email VARCHAR(120) NOT NULL,
                feed_score INTEGER NOT NULL CHECK(feed_score BETWEEN 1 AND 5),
                comments VARCHAR(2000) NULL,
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
                role text NOT NULL CHECK(role IN ('admin', 'user')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                token VARCHAR(64) PRIMARY KEY,
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
                location VARCHAR(200) DEFAULT '',
                salary VARCHAR(80) DEFAULT '',
                url VARCHAR(500) DEFAULT '',
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        for col, typedef in [
            ('location', "VARCHAR(200) DEFAULT ''"),
            ('salary', "VARCHAR(80) DEFAULT ''"),
            ('url', "VARCHAR(500) DEFAULT ''"),
        ]:
            _ensure_column(cursor, 'job_applications', col, typedef)

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
                preferred_location VARCHAR(200) DEFAULT '',
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

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_cache (
                content_hash VARCHAR(64) NOT NULL,
                target_role VARCHAR(200) NOT NULL DEFAULT '',
                result_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at INTEGER,
                PRIMARY KEY (content_hash, target_role)
            )
        ''')
        _ensure_column(cursor, 'analysis_cache', 'expires_at', 'INTEGER')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rate_limits (
                key VARCHAR(100) PRIMARY KEY,
                count INTEGER DEFAULT 0,
                updated_at INTEGER NOT NULL
            )
        ''')
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rate_limits_updated ON rate_limits(updated_at)")

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS login_attempts (
                username VARCHAR(100) PRIMARY KEY,
                attempts INTEGER DEFAULT 0,
                first_attempt INTEGER NOT NULL,
                locked_until INTEGER DEFAULT 0
            )
        ''')

        if os.getenv("SEED_DEMO", "0") == "1":
            cursor.execute("SELECT id FROM users WHERE username = 'admin'")
            if cursor.fetchone() is None:
                from api.security import get_password_hash
                default_hashed = get_password_hash("admin123")
                cursor.execute('''
                    INSERT INTO users (username, email, full_name, hashed_password, role)
                    VALUES (?, ?, ?, ?, ?)
                ''', ("admin", "admin@analyzer.com", "System Admin", default_hashed, "admin"))

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_timestamp ON user_data(Timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_data_predicted_field ON user_data(Predicted_Field)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_shared_reports_token ON shared_reports(token)")

        cursor.execute("DELETE FROM analysis_cache WHERE expires_at IS NOT NULL AND expires_at < ?",
                       (int(time.time()),))
        cursor.execute("DELETE FROM rate_limits WHERE updated_at < ?", (int(time.time() // 60) - 5,))

        conn.commit()
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()


init_db()
