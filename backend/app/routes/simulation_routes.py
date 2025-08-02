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
    """Sauvegarde une simulation pour un client"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    try:
        client_id = data.get('client_id')
        if not client_id:
            return jsonify({'msg': 'Client ID requis'}), 400
        
        # Vérifier que le client appartient à l'utilisateur
        client = Client.get_by_id(client_id)
        if not client or client['user_id'] != user_id:
            return jsonify({'msg': 'Client non trouvé ou non autorisé'}), 403
        
        # Calculer la simulation
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
        
        # Sauvegarder en base
        simulation_data = {
            'montant_finance': result['montant_finance'],
            'duree': N,
            'taux_interet': T,
            'mensualite': result['mensualite']
        }
        
        simulation_id = Simulation.create(client_id, user_id, simulation_data)
        
        return jsonify({
            'msg': 'Simulation sauvegardée avec succès',
            'simulation_id': simulation_id,
            'result': result
        }), 201
    
    except Exception as e:
        return jsonify({'msg': 'Erreur lors de la sauvegarde', 'error': str(e)}), 500