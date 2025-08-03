from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.client import Client

client_bp = Blueprint('client', __name__)

@client_bp.route('/', methods=['GET'])
@jwt_required()
def get_clients():
    user_id_str = get_jwt_identity()  # Récupère une string
    user_id = int(user_id_str)  # Convertit en int pour la DB
    
    try:
        clients = Client.get_by_user(user_id)
        return jsonify(clients)
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({'msg': 'Erreur serveur'}), 500

@client_bp.route('/', methods=['POST'])
@jwt_required()
def create_client():
    user_id_str = get_jwt_identity()  # Récupère une string
    user_id = int(user_id_str)  # Convertit en int pour la DB
    
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone', '')
    
    if not name or not email:
        return jsonify({'msg': 'Nom et email requis'}), 400
    
    try:
        client_id = Client.create(name, email, phone, user_id)
        return jsonify({'msg': 'Client créé avec succès', 'client_id': client_id}), 201
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({'msg': 'Erreur lors de la création du client'}), 500

@client_bp.route('/<int:client_id>', methods=['DELETE'])
@jwt_required()
def delete_client(client_id):
    """Supprime un client et toutes ses simulations associées"""
    try:
        current_user_id = get_jwt_identity()
        
        # Vérifier que le client appartient à l'utilisateur
        client = Client.get_by_id(client_id)
        if not client or int(client['user_id']) != int(current_user_id):
            return jsonify({'msg': 'Client non trouvé ou non autorisé'}), 403
        
        # Supprimer le client (et ses simulations via CASCADE)
        Client.delete(client_id)
        
        return jsonify({'msg': 'Client supprimé avec succès'}), 200
        
    except Exception as e:
        print(f"Erreur lors de la suppression du client: {str(e)}")
        return jsonify({'msg': f'Erreur lors de la suppression: {str(e)}'}), 500