import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
# Use Vercel Postgres URL or local fallback
DB_URL = os.getenv("POSTGRES_URL")
if DB_URL and DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL or "sqlite:///pos.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")

db = SQLAlchemy(app)
jwt = JWTManager(app)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "POS API"}), 200

# Blueprint imports
from .routes.inventory import inventory_bp
from .routes.auth import auth_bp
from .routes.sales import sales_bp
from .routes.finance import finance_bp
from .routes.hr import hr_bp
from .routes.purchases import purchases_bp

app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(sales_bp, url_prefix="/api/sales")
app.register_blueprint(finance_bp, url_prefix="/api/finance")
app.register_blueprint(hr_bp, url_prefix="/api/hr")
app.register_blueprint(purchases_bp, url_prefix="/api/purchases")

if __name__ == "__main__":
    app.run(debug=True)
