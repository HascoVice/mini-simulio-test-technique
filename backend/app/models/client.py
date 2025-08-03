import pymysql

# Définir la configuration directement comme dans user.py
DB_CONFIG = {
    "host": "mysql",          
    "user": "root",
    "password": "Hassan123+",
    "database": "simulio"
}

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
        """Récupère un client par son ID"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        try:
            cursor.execute(
                "SELECT * FROM clients WHERE id = %s", 
                (client_id,)
            )
            client = cursor.fetchone()
            return client
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def delete(client_id):
        """Supprime un client et toutes ses simulations"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        try:
            # Supprimer d'abord les simulations du client
            cursor.execute("DELETE FROM simulations WHERE client_id = %s", (client_id,))
            
            # Puis supprimer le client
            cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
            
            conn.commit()
            return True
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()