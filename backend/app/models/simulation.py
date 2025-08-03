import pymysql
from app.models.user import DB_CONFIG
import pandas as pd
import numpy as np
import numpy_financial
import datetime
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

class Simulation:
    @staticmethod
    def calculate_simulation_complete(N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien):
        """
        Calcule une simulation complète avec la fonction fournie
        Retourne un dictionnaire JSON-friendly au lieu des DataFrames
        """
        
        # Appel de la fonction originale
        M, I, A, fraisNotaire_calc, garantieBancaire, salaireMinimum, df, fraisAgence2, C2_final, output2, output3, output4, output13, TRAVAUX_out = CalculerMensualité39_bis2_ANCIEN(
            N, C2, T, ASSU, apport, mois, annee, fraisAgence, fraisNotaire, TRAVAUX, revalorisationBien
        )
        
        # Convertir les DataFrames en dictionnaires pour JSON
        tableau_amortissement = df.to_dict('records')
        resume_financement = output2.to_dict('records')[0]
        details_pret = output3.to_dict('records')[0]
        dates_financement = output4.to_dict('records')[0]
        evolution_patrimoine = output13.to_dict('records')
        
        return {
            "mensualite": round(M, 2),
            "interets_totaux": round(I, 2),
            "assurance_totale": round(A, 2),
            "frais_notaire": round(fraisNotaire_calc, 2),
            "garantie_bancaire": round(garantieBancaire, 2),
            "salaire_minimum": salaireMinimum,
            "frais_agence": round(fraisAgence2, 2),
            "montant_finance": round(C2_final, 2),
            "travaux": TRAVAUX_out,
            "tableau_amortissement": tableau_amortissement,
            "resume_financement": resume_financement,
            "details_pret": details_pret,
            "dates_financement": dates_financement,
            "evolution_patrimoine": evolution_patrimoine
        }
    
    @staticmethod
    def create(client_id, user_id, simulation_data):
        """Sauvegarde une simulation complète en base"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO simulations 
               (client_id, user_id, amount, duration, interest_rate, monthly_payment,
                montant_finance, salaire_minimum, interets_totaux, assurance_totale,
                frais_notaire, garantie_bancaire, frais_agence, travaux, apport,
                prix_bien, taux_assurance, frais_agence_pct, frais_notaire_pct) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (client_id, user_id, 
             simulation_data.get('montant_finance', 0),
             simulation_data.get('duree_annees', 0), 
             simulation_data.get('taux_interet', 0), 
             simulation_data.get('mensualite', 0),
             simulation_data.get('montant_finance', 0),
             simulation_data.get('salaire_minimum', 0),
             simulation_data.get('interets_totaux', 0),
             simulation_data.get('assurance_totale', 0),
             simulation_data.get('frais_notaire', 0),
             simulation_data.get('garantie_bancaire', 0),
             simulation_data.get('frais_agence', 0),
             simulation_data.get('travaux', 0),
             simulation_data.get('apport', 0),
             simulation_data.get('prix_bien', 0),
             simulation_data.get('taux_assurance', 0),
             simulation_data.get('frais_agence_pct', 0),
             simulation_data.get('frais_notaire_pct', 0))
        )
        conn.commit()
        simulation_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return simulation_id
    
    @staticmethod
    def get_by_client(client_id):
        """Récupère toutes les simulations d'un client"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.amount, s.duration, s.interest_rate, s.monthly_payment, s.created_at,
                   c.name as client_name, c.email as client_email
            FROM simulations s
            JOIN clients c ON s.client_id = c.id
            WHERE s.client_id = %s
            ORDER BY s.created_at DESC
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return [{
            "id": row[0],
            "amount": float(row[1]),
            "duration": row[2],
            "interest_rate": float(row[3]),
            "monthly_payment": float(row[4]),
            "created_at": str(row[5]),
            "client_name": row[6],
            "client_email": row[7]
        } for row in rows]
    
    @staticmethod
    def get_by_id(simulation_id):
        """Récupère une simulation par son ID avec tous les détails"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        try:
            cursor.execute("""
                SELECT s.*, c.name as client_name, c.email as client_email, c.user_id
                FROM simulations s
                JOIN clients c ON s.client_id = c.id
                WHERE s.id = %s
            """, (simulation_id,))
            
            simulation = cursor.fetchone()
            return simulation
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_by_user(user_id):
        """Récupère toutes les simulations d'un utilisateur avec tous les détails"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        try:
            cursor.execute("""
                SELECT s.*, c.name as client_name, c.email as client_email
                FROM simulations s
                JOIN clients c ON s.client_id = c.id
                WHERE c.user_id = %s
                ORDER BY s.created_at DESC
            """, (user_id,))
            
            simulations = cursor.fetchall()
            return simulations
            
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def update(simulation_id, simulation_data):
        """Met à jour une simulation existante"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE simulations SET 
               amount = %s, duration = %s, interest_rate = %s, monthly_payment = %s,
               montant_finance = %s, salaire_minimum = %s, interets_totaux = %s, 
               assurance_totale = %s, frais_notaire = %s, garantie_bancaire = %s,
               frais_agence = %s, travaux = %s, apport = %s, prix_bien = %s,
               taux_assurance = %s, frais_agence_pct = %s, frais_notaire_pct = %s
               WHERE id = %s""",
            (simulation_data.get('montant_finance', 0),
             simulation_data.get('duree_annees', 0),
             simulation_data.get('taux_interet', 0),
             simulation_data.get('mensualite', 0),
             simulation_data.get('montant_finance', 0),
             simulation_data.get('salaire_minimum', 0),
             simulation_data.get('interets_totaux', 0),
             simulation_data.get('assurance_totale', 0),
             simulation_data.get('frais_notaire', 0),
             simulation_data.get('garantie_bancaire', 0),
             simulation_data.get('frais_agence', 0),
             simulation_data.get('travaux', 0),
             simulation_data.get('apport', 0),
             simulation_data.get('prix_bien', 0),
             simulation_data.get('taux_assurance', 0),
             simulation_data.get('frais_agence_pct', 0),
             simulation_data.get('frais_notaire_pct', 0),
             simulation_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True
    
    @staticmethod
    def delete(simulation_id):
        """Supprime une simulation"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM simulations WHERE id = %s", (simulation_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return True

    @staticmethod
    def delete_simulation(simulation_id):
        """Supprime une simulation"""
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        try:
            # Vérifier que la simulation existe
            cursor.execute("SELECT * FROM simulations WHERE id = %s", (simulation_id,))
            simulation = cursor.fetchone()
            if not simulation:
                return jsonify({'msg': 'Simulation non trouvée'}), 404
            
            # Vérifier que la simulation appartient à l'utilisateur courant
            current_user_id = get_jwt_identity()
            if int(current_user_id) != int(simulation['user_id']):
                return jsonify({'msg': 'Simulation non autorisée'}), 403
            
            # Supprimer la simulation
            cursor.execute("DELETE FROM simulations WHERE id = %s", (simulation_id,))
            conn.commit()
            
            return jsonify({'msg': 'Simulation supprimée avec succès'}), 200
        
        except Exception as e:
            print(f"Erreur lors de la suppression de la simulation: {str(e)}")
            return jsonify({'msg': f'Erreur lors de la suppression: {str(e)}'}), 500
        
        finally:
            cursor.close()
            conn.close()

def CalculerMensualité39_bis2_ANCIEN(N,C2,T,ASSU,apport,mois,annee,fraisAgence,fraisNotaire,TRAVAUX,revalorisationBien):
    """Fonction originale - copiée exactement"""
    
    CDEPART = C2
    fraisAgence2 = (fraisAgence/100)*C2
    fraisNotaire = (fraisNotaire/100)*C2
    C2 = C2 - apport
    garantieBancaire = (1.5/100)*C2
    if  garantieBancaire <0:
        garantieBancaire = 0
    else :
        garantieBancaire = garantieBancaire
    if  fraisAgence2 <0:
        fraisAgence2 = 0
    else :
        fraisAgence2 = fraisAgence2
    C2 = C2 + fraisNotaire + garantieBancaire + fraisAgence2 + TRAVAUX
    N2 =  N
    N = N * 12
    t = (T / 12)
    q = 1 + t / 100 # calcul du coefficient multiplicateur associé à une hausse de t%
    M = (q**N * (C2) * (1 - q) / (1 - q**N)) + C2*((ASSU/100)/12)
    A = C2*((ASSU/100))*(N/12)
    #print("Votre mensualité sera de {0:.2f} euros".format(M))
    I = N * M - C2 # calcul des intérêts versés
    T2 = T*1/100
    date = "{}/01/{}".format(mois,annee)
    rng = pd.date_range(start=date, periods=N, freq='MS')
    rng.name = "Date"
    df = pd.DataFrame(index=rng, columns=['Mensualité', 'Capital Amorti', 'Intérêts', 'Capital restant dû'], dtype='float')
    df.reset_index(inplace=True)
    df.index += 1
    df.index.name = "Mois"

    df["Mensualité"] = -1 * numpy_financial.pmt(T2/12, N, C2)+ C2*((ASSU/100)/12)
    df["Capital Amorti"] = -1 * numpy_financial.ppmt(T2/12,df.index,N, C2)
    df["Intérêts"] = -1 * numpy_financial.ipmt(T2/12,df.index, N, C2)
    df = df.round(2)

    df["Capital restant dû"] = 0
    df.loc[1, "Capital restant dû"] = C2 - df.loc[1, "Capital Amorti"]

    for period in range(2, len(df)+1):
        previous_balance = df.loc[period-1, "Capital restant dû"]
        principal_paid = df.loc[period, "Capital Amorti"]

        if previous_balance == 0:
            df.loc[period, ["Mensualité", 'Capital Amorti', "Intérêts", "Capital restant dû"]] == 0
            continue
        elif principal_paid <= previous_balance:
            df.loc[period, "Capital restant dû"] = previous_balance - principal_paid

    df["Date"] = pd.to_datetime(df["Date"],format='%d-%m-%Y')

    salaireMinimum = (M*100)/35
    salaireMinimum = int(salaireMinimum)
    

    if M < 0:
        M=0
    else :
        M=M
    
    if salaireMinimum < 0:
        salaireMinimum = 0
    else :
        salaireMinimum = salaireMinimum

    if C2 < 0:
        C2 = 0
    else :
        C2 = C2
    

    data = {
    "Prix du bien": CDEPART, 
    'Frais de notaire': fraisNotaire,
    'Garantie Bancaire': garantieBancaire,
    "Frais d'agence": fraisAgence2,
    "Apport": apport,
    "Total à financer": C2
    }

    # Créez un DataFrame à partir du dictionnaire
    output2 = pd.DataFrame([data])
    
    #print(output2)

    data2 = {
    "Montant du prêt total": C2, 
    "Taux d'intérêt" : T,
    "Taux d'assurance" : ASSU,
    "Mensualité de crédit" : df["Mensualité"].iloc[0],
    }

    output3 = pd.DataFrame([data2])

    date_initiale = datetime.datetime.strptime("{}/01/{}".format(mois, annee), "%d/%m/%Y")

    # Ajouter 25 ans

    date_finale = date_initiale.replace(year=date_initiale.year + N2)

    # Formater la date finale
    date_finale_str = date_finale.strftime("%d/%m/%Y")

    data3 = {
    "Date d'acquisition": date, 
    "Fin du financement" : date_finale_str,
    }

    output4 = pd.DataFrame([data3])
    #print(output4)


    liste_prixdubien = []
    prixDuBien2 = CDEPART
    listeprixdubieninitial = [prixDuBien2]
    for year in range(1, (int((N)/12)+1)):
        prixDuBien2 = prixDuBien2*(1+(revalorisationBien/100))
        liste_prixdubien.append(prixDuBien2)
    listeprixdubieninitial.extend(liste_prixdubien)

    nbreMois = (N)/12
    nbreMois = int(nbreMois)
    liste_annne = []
    for i in range(0,(nbreMois+1)):
        a = date_initiale.year + i
        liste_annne.append(a)

    
    df_somme = pd.DataFrame(
    {
    'Prix du bien' : listeprixdubieninitial,
    "Date" :liste_annne,
    })
    #print(df_somme)
    df["Date"] = pd.to_datetime(df["Date"],format='%d/%m/%Y')

    
    df['Year'] = df['Date'].dt.year

    # Créez le dictionnaire de mappage avec les années
    products_dict = dict(zip(df.Year, df["Capital restant dû"]))

    # Utilisez le dictionnaire pour mettre à jour df_somme
    df_somme["Capital restant dû"] = df_somme["Date"].map(products_dict)
    df_somme["Capital restant dû"] = df_somme["Capital restant dû"].fillna(0)  # Remplace NaN par 0
    df_somme["Capital restant dû"] = df_somme["Capital restant dû"].replace([float('inf'), -float('inf')], 0)  # Remplace inf et -inf par 0
    df_somme["Somme disponible en cas de revente"] = df_somme["Prix du bien"] - df_somme["Capital restant dû"]
    df_somme.index += 1
    df_somme.index.name = "Periode (Année)"
    

    df_somme = df_somme.drop(columns="Date", axis = 1)
    df_somme["Periode (en années)"] = liste_annne
    df_somme = df_somme.set_index("Periode (en années)")
    output13 = df_somme
    
           
    return M,I,A,fraisNotaire,garantieBancaire,salaireMinimum,df,fraisAgence2,C2,output2,output3,output4,output13,TRAVAUX