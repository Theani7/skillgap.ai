import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cv.db")

def migrate_analysis_data():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # We will store the entire JSON payload returned from Gemini here so it can be replayed
        cursor.execute("ALTER TABLE user_data ADD COLUMN analysis_data TEXT DEFAULT NULL")
        print("Added 'analysis_data' to user_data table.")
    except sqlite3.OperationalError as e:
        print(f"Column 'analysis_data' might already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_analysis_data()
