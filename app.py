from flask import Flask, jsonify, request
import pymysql

app=Flask(__name__)

DB_CONFIG = {
    "host": "mysql",          
    "user": "root",
    "password": "Hassan123+",
    "database": "simulio"
}

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, API!"})

@app.route('/api/users', methods=['GET'])
def get_users():
    # Connexion avec config réutilisable
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, email FROM users")
    rows = cursor.fetchall()

    conn.close()

    # Transformer en liste de dictionnaires
    users = [
        {"id": row[0], "name": row[1], "email": row[2]}
        for row in rows
    ]

    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)