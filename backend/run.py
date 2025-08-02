from flask import Flask, jsonify
from flask_jwt_extended import JWTManager, jwt_required
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.client_routes import client_bp  # ← Ajouter ça

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "votre_cle_secrete"
jwt = JWTManager(app)

CORS(app, origins=["http://localhost:5173"])

# Enregistrer les blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(client_bp, url_prefix='/api/clients')  # ← Ajouter ça

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, API!"})

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(msg="Accès autorisé")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)