FROM python:3.11-slim

ENV APP_HOME=/app
WORKDIR $APP_HOME

# Copier les fichiers requis et installer les dépendances Python
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=run.py
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]