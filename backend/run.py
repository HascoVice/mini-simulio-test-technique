from flask import Flask, jsonify
from flask_jwt_extended import JWTManager, jwt_required
from flask_cors import CORS
from datetime import timedelta
from app.routes.auth_routes import auth_bp
from app.routes.client_routes import client_bp
from app.routes.simulation_routes import simulation_bp

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "votre_cle_secrete"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Configuration CORS avec localhost ET 127.0.0.1
CORS(app, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Gérer l'expiration du token
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'msg': 'Token expiré'}), 401

# Enregistrer les blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(client_bp, url_prefix='/api/clients')
app.register_blueprint(simulation_bp, url_prefix='/api/simulations')

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, API!"})

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify(msg="Accès autorisé")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)