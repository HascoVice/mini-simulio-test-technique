from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.simulation import Simulation
from app.models.client import Client

simulation_bp = Blueprint('simulations', __name__)

@simulation_bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate_simulation():
    """Calcule une simulation complète avec la fonction exacte du recruteur"""
    data = request.get_json()
    
    try:
        # Récupération des paramètres avec valeurs par défaut
        N = int(data.get('duree_annees', 25))
        C2 = float(data.get('prix_bien', 200000))
        T = float(data.get('taux_interet', 4))
        ASSU = float(data.get('taux_assurance', 0.3))
        apport = float(data.get('apport', 0))
        mois = data.get('mois', '02')
        annee = data.get('annee', '2025')
        fraisAgence = float(data.get('frais_agence_pct', 3))
        fraisNotaire = float(data.get('frais_notaire_pct', 2.5))
        TRAVAUX = float(data.get('travaux', 0))
        revalorisationBien = float(data.get('revalorisation_pct', 1))
        
        # Utilise la fonction exacte du recruteur
        result = Simulation.calculate_simulation_complete(
            N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'msg': 'Erreur de calcul', 'error': str(e)}), 400

@simulation_bp.route('/calculate-simple', methods=['POST'])
@jwt_required()
def calculate_simulation_simple():
    """Version simplifiée qui retourne juste les infos principales"""
    data = request.get_json()
    
    try:
        N = int(data.get('duree_annees', 25))
        C2 = float(data.get('prix_bien', 200000))
        T = float(data.get('taux_interet', 4))
        ASSU = float(data.get('taux_assurance', 0.3))
        apport = float(data.get('apport', 0))
        mois = data.get('mois', '02')
        annee = data.get('annee', '2025')
        fraisAgence = float(data.get('frais_agence_pct', 3))
        fraisNotaire = float(data.get('frais_notaire_pct', 2.5))
        TRAVAUX = float(data.get('travaux', 0))
        revalorisationBien = float(data.get('revalorisation_pct', 1))
        
        # Utilise la fonction exacte du recruteur
        result = Simulation.calculate_simulation_complete(
            N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien
        )
        
        # Résumé simple pour l'interface
        return jsonify({
            "mensualite": result["mensualite"],
            "prix_bien": C2,
            "frais_notaire": result["frais_notaire"],
            "garantie_bancaire": result["garantie_bancaire"],
            "travaux": result["travaux"],
            "frais_agence": result["frais_agence"],
            "montant_finance": result["montant_finance"],
            "salaire_minimum": result["salaire_minimum"],
            "interets_totaux": result["interets_totaux"],
            "assurance_totale": result["assurance_totale"],
            "duree_annees": N,
            "taux_interet": T,
            "taux_assurance": ASSU,
            "apport": apport
        })
    
    except Exception as e:
        return jsonify({'msg': 'Erreur de calcul', 'error': str(e)}), 400

@simulation_bp.route('/save', methods=['POST'])
@jwt_required()
def save_simulation():
    """Sauvegarde une simulation complète pour un client"""
    data = request.get_json()
    current_user = get_jwt_identity()
    
    try:
        client_id = data.get('client_id')
        if not client_id:
            return jsonify({"msg": "Client ID requis"}), 400
            
        # Récupération des paramètres
        N = int(data.get('duree_annees', 25))
        C2 = float(data.get('prix_bien', 200000))
        T = float(data.get('taux_interet', 4))
        ASSU = float(data.get('taux_assurance', 0.3))
        apport = float(data.get('apport', 0))
        mois = data.get('mois', '02')
        annee = data.get('annee', '2025')
        fraisAgence = float(data.get('frais_agence_pct', 3))
        fraisNotaire = float(data.get('frais_notaire_pct', 2.5))
        TRAVAUX = float(data.get('travaux', 0))
        revalorisationBien = float(data.get('revalorisation_pct', 1))
        
        # Calcul complet
        result = Simulation.calculate_simulation_complete(
            N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien
        )
        
        # Préparation des données complètes pour la sauvegarde
        simulation_data = {
            'montant_finance': result['montant_finance'],
            'duree_annees': N,
            'taux_interet': T,
            'mensualite': result['mensualite'],
            'salaire_minimum': result['salaire_minimum'],
            'interets_totaux': result['interets_totaux'],
            'assurance_totale': result['assurance_totale'],
            'frais_notaire': result['frais_notaire'],
            'garantie_bancaire': result['garantie_bancaire'],
            'frais_agence': result['frais_agence'],
            'travaux': TRAVAUX,
            'apport': apport,
            'prix_bien': C2,
            'taux_assurance': ASSU,
            'frais_agence_pct': fraisAgence,
            'frais_notaire_pct': fraisNotaire
        }
        
        # Sauvegarde en base
        simulation_id = Simulation.create(client_id, current_user, simulation_data)
        
        return jsonify({
            "msg": "Simulation sauvegardée avec succès",
            "simulation_id": simulation_id,
            "data": simulation_data
        }), 201
        
    except Exception as e:
        return jsonify({"msg": f"Erreur: {str(e)}"}), 500

@simulation_bp.route('/client/<int:client_id>', methods=['GET'])
@jwt_required()
def get_client_simulations(client_id):
    """Récupère toutes les simulations d'un client"""
    user_id = int(get_jwt_identity())
    
    try:
        # Vérifier que le client appartient à l'utilisateur
        client = Client.get_by_id(client_id)
        if not client or client['user_id'] != user_id:
            return jsonify({'msg': 'Client non trouvé ou non autorisé'}), 403
        
        # Récupérer les simulations
        simulations = Simulation.get_by_client(client_id)
        return jsonify(simulations)
    
    except Exception as e:
        return jsonify({'msg': 'Erreur lors de la récupération', 'error': str(e)}), 500

@simulation_bp.route('/<int:simulation_id>', methods=['GET'])
@jwt_required()
def get_simulation(simulation_id):
    """Récupère une simulation spécifique"""
    try:
        current_user_id = get_jwt_identity()
        simulation = Simulation.get_by_id(simulation_id)
        
        # DEBUG - Ajouter les mêmes logs que pour PUT
        print(f"DEBUG GET - current_user_id: {current_user_id} (type: {type(current_user_id)})")
        print(f"DEBUG GET - simulation: {simulation}")
        
        if not simulation:
            return jsonify({"msg": "Simulation non trouvée"}), 404
        
        simulation_user_id = simulation.get('user_id')
        print(f"DEBUG GET - simulation_user_id: {simulation_user_id} (type: {type(simulation_user_id)})")
        print(f"DEBUG GET - Comparaison: {current_user_id} == {simulation_user_id} = {current_user_id == simulation_user_id}")
        
        # UTILISER LA MÊME LOGIQUE QUE PUT : convertir les types
        if int(current_user_id) != int(simulation['user_id']):
            return jsonify({"msg": "Simulation non autorisée pour cet utilisateur"}), 403
            
        return jsonify(simulation), 200
        
    except Exception as e:
        print(f"DEBUG GET - Erreur: {str(e)}")
        return jsonify({"msg": f"Erreur: {str(e)}"}), 500

@simulation_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_simulations():
    """Récupère toutes les simulations de l'utilisateur connecté"""
    user_id = int(get_jwt_identity())
    
    try:
        simulations = Simulation.get_by_user(user_id)
        return jsonify(simulations)
    
    except Exception as e:
        return jsonify({'msg': 'Erreur lors de la récupération', 'error': str(e)}), 500

@simulation_bp.route('/<int:simulation_id>', methods=['PUT'])
@jwt_required()
def update_simulation(simulation_id):
    """Met à jour une simulation existante"""
    try:
        # Récupération des données JSON
        data = request.get_json()
        
        # Vérification que la simulation appartient à l'utilisateur actuel
        current_user_id = get_jwt_identity()
        existing_simulation = Simulation.get_by_id(simulation_id)
        
        # DEBUG - Ajouter des logs pour comprendre le problème
        print(f"DEBUG - current_user_id: {current_user_id} (type: {type(current_user_id)})")
        print(f"DEBUG - existing_simulation: {existing_simulation}")
        
        if existing_simulation:
            simulation_user_id = existing_simulation.get('user_id')
            print(f"DEBUG - simulation_user_id: {simulation_user_id} (type: {type(simulation_user_id)})")
            print(f"DEBUG - Comparaison: {current_user_id} == {simulation_user_id} = {current_user_id == simulation_user_id}")
        
        if not existing_simulation:
            return jsonify({"msg": "Simulation non trouvée"}), 404
            
        # Convertir les types pour la comparaison
        if int(current_user_id) != int(existing_simulation['user_id']):
            return jsonify({"msg": "Simulation non autorisée pour cet utilisateur"}), 403
        
        # Extraction des paramètres
        client_id = data.get('client_id')
        C2 = float(data.get('prix_bien', 100000))
        TRAVAUX = float(data.get('travaux', 0))
        N = int(data.get('duree_annees', 10))
        T = float(data.get('taux_interet', 1))
        ASSU = float(data.get('taux_assurance', 0.1))
        apport = float(data.get('apport', 0))
        fraisAgence = float(data.get('frais_agence_pct', 0))
        fraisNotaire = float(data.get('frais_notaire_pct', 2))
        mois = data.get('mois', '02')
        annee = data.get('annee', '2025')
        revalorisationBien = float(data.get('revalorisation_pct', 0))

        # Calcul de la simulation complète
        result = Simulation.calculate_simulation_complete(
            N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien
        )
        
        # Mise à jour des données de la simulation
        simulation_data = {
            'montant_finance': result['montant_finance'],
            'duree_annees': N,
            'taux_interet': T,
            'mensualite': result['mensualite'],
            'salaire_minimum': result['salaire_minimum'],
            'interets_totaux': result['interets_totaux'],
            'assurance_totale': result['assurance_totale'],
            'frais_notaire': result['frais_notaire'],
            'garantie_bancaire': result['garantie_bancaire'],
            'frais_agence': result['frais_agence'],
            'travaux': TRAVAUX,
            'apport': apport,
            'prix_bien': C2,
            'taux_assurance': ASSU,
            'frais_agence_pct': fraisAgence,
            'frais_notaire_pct': fraisNotaire
        }
        
        # Sauvegarde des modifications
        Simulation.update(simulation_id, simulation_data)
        
        return jsonify({
            "msg": "Simulation mise à jour avec succès",
            "simulation_id": simulation_id,
            "data": simulation_data
        }), 200
        
    except Exception as e:
        print(f"DEBUG - Erreur dans update_simulation: {str(e)}")
        return jsonify({"msg": f"Erreur: {str(e)}"}), 500

@simulation_bp.route('/<int:simulation_id>', methods=['DELETE'])
@jwt_required()
def delete_simulation(simulation_id):
    """Supprime une simulation"""
    try:
        current_user_id = get_jwt_identity()
        
        # Vérifier que la simulation appartient à l'utilisateur
        simulation = Simulation.get_by_id(simulation_id)
        if not simulation or int(simulation['user_id']) != int(current_user_id):
            return jsonify({'msg': 'Simulation non trouvée ou non autorisée'}), 403
        
        # Supprimer la simulation
        Simulation.delete(simulation_id)
        
        return jsonify({'msg': 'Simulation supprimée avec succès'}), 200
        
    except Exception as e:
        return jsonify({'msg': f'Erreur lors de la suppression: {str(e)}'}), 500
