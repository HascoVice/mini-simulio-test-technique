from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import User
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.get_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
        return jsonify({'msg': 'Email ou mot de passe incorrect'}), 401
    
    access_token = create_access_token(identity=user['id'])
    return jsonify({'access_token': access_token})