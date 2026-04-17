import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cv.db")

def migrate_full_name():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Default to the username if full_name is newly added for existing rows
        cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(100) DEFAULT 'User'")
        cursor.execute("UPDATE users SET full_name = username WHERE full_name = 'User'")
        print("Added 'full_name' to users table.")
    except sqlite3.OperationalError as e:
        print(f"Column 'full_name' might already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_full_name()
