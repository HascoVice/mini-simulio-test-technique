import pymysql

DB_CONFIG = {
    "host": "mysql",          
    "user": "root",
    "password": "Hassan123+",
    "database": "simulio"
}

class User:
    @staticmethod
    def get_by_email(email):
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return {"id": row[0], "name": row[1], "email": row[2], "password": row[3]}
        return None