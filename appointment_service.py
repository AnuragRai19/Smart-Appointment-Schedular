# appointment_service.py
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

# --- App Configuration ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'appointments.db')
db = SQLAlchemy(app)

# --- Database Model (from your OOAD) [cite: 65] ---
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    doctor_id = db.Column(db.Integer, nullable=False)
    # We add these fields for the dashboard
    patient_name = db.Column(db.String(150))
    doctor_name = db.Column(db.String(150))
    specialty = db.Column(db.String(150))
    
    appointment_datetime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Scheduled') # Scheduled, Canceled

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "patient_name": self.patient_name,
            "doctor_name": self.doctor_name,
            "specialty": self.specialty,
            "datetime": self.appointment_datetime.isoformat(),
            "status": self.status
        }

# --- API Endpoints (Service Contract) ---

# This endpoint matches UC2: Book Appointment [cite: 72]
@app.route('/appointments', methods=['POST'])
def book_appointment():
    data = request.json
    try:
        dt = datetime.fromisoformat(data.get('datetime'))
        new_appointment = Appointment(
            patient_id=data.get('patient_id'),
            doctor_id=data.get('doctor_id'),
            patient_name=data.get('patient_name'),
            doctor_name=data.get('doctor_name'),
            specialty=data.get('specialty'),
            appointment_datetime=dt
        )
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify(new_appointment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Booking failed", "details": str(e)}), 400

# This endpoint matches UC3: Modify/Cancel Appointment [cite: 72]
@app.route('/appointments/<int:id>/cancel', methods=['PUT'])
def cancel_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    appointment.status = 'Canceled'
    db.session.commit()
    return jsonify(appointment.to_dict()), 200

# Get appointments for a specific patient
@app.route('/appointments/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    return jsonify([appt.to_dict() for appt in appointments]), 200

# Get appointments for a specific doctor
@app.route('/appointments/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    return jsonify([appt.to_dict() for appt in appointments]), 200
    
# Get all appointments (for Admin)
@app.route('/appointments', methods=['GET'])
def get_all_appointments():
    appointments = Appointment.query.all()
    return jsonify([appt.to_dict() for appt in appointments]), 200

# --- Run the Service ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Run on port 5002
    app.run(debug=True, port=5002)