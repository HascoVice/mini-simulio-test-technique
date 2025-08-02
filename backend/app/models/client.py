import pymysql
from app.models.user import DB_CONFIG

class Client:
    @staticmethod
    def get_by_user(user_id):
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, user_id, created_at FROM clients WHERE user_id=%s", (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [{"id": row[0], "name": row[1], "email": row[2], "phone": row[3], "user_id": row[4], "created_at": str(row[5])} for row in rows]
    
    @staticmethod
    def create(name, email, phone, user_id):
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO clients (name, email, phone, user_id) VALUES (%s, %s, %s, %s)",
            (name, email, phone, user_id)
        )
        conn.commit()
        client_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return client_id
    
    @staticmethod
    def get_by_id(client_id):
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, phone, user_id FROM clients WHERE id=%s", (client_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return {"id": row[0], "name": row[1], "email": row[2], "phone": row[3], "user_id": row[4]}
        return None