import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.models import db
from routes.auth import auth_bp
from routes.routes import routes_bp
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure database
    if os.getenv("TESTING"):
        database_url = "sqlite:///:memory:"
    else:
        database_url = os.getenv("DATABASE_URL")
        # Handle postgres protocol schema mismatch for sqlalchemy if needed
        if database_url and database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        if database_url and "?schema=" in database_url:
            # Strip schema parameter for sqlalchemy/psycopg2
            database_url = database_url.split("?")[0]
        
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///local_orari.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Ensure key is at least 32 bytes for SHA256 in newer PyJWT/flask-jwt-extended
    secret = os.getenv("JWT_SECRET_KEY", "super-secret-key-that-is-very-long-32-bytes")
    if len(secret.encode('utf-8')) < 32:
        secret = secret.ljust(32, "x")
    app.config["JWT_SECRET_KEY"] = secret
    
    CORS(app)
    JWTManager(app)
    
    db.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(routes_bp, url_prefix='/api')
    
    with app.app_context():
        # Fallback database creation if not using prisma migrations
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
