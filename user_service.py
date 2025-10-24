# user_service.py
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# --- App Configuration ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
db = SQLAlchemy(app)

# --- Database Model (from your OOAD) [cite: 65] ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False) # 'patient', 'doctor', 'admin'
    specialty = db.Column(db.String(100), nullable=True) # For doctors

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Helper to convert object to dictionary for JSON
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "specialty": self.specialty
        }

# --- API Endpoints (Service Contract) ---

# This endpoint matches UC1: Register/Login [cite: 72]
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    try:
        user = User(
            email=data.get('email'),
            full_name=data.get('full_name'),
            role=data.get('role'),
            specialty=data.get('specialty') if data.get('role') == 'doctor' else None
        )
        user.set_password(data.get('password'))
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and user.check_password(data.get('password')):
        # In a real app, you'd return a JWT Token [cite: 98]
        return jsonify(user.to_dict()), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# This endpoint matches UC6: Add New Doctor (but here just lists doctors) [cite: 72]
@app.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    return jsonify([doc.to_dict() for doc in doctors]), 200
    
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200


# --- Run the Service ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Run on port 5001
    app.run(debug=True, port=5001)