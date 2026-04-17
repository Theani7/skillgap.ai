import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cv.db")

def migrate_user_id():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE user_data ADD COLUMN user_id INTEGER DEFAULT -1")
        print("Added 'user_id' to user_data.")
    except sqlite3.OperationalError as e:
        print(f"Column 'user_id' might already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_user_id()
