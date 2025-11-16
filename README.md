# Smart Appointment Scheduler

"Smart Appointment Scheduler" is a full-stack web application built with a **microservices architecture**. It provides a complete, role-based system for managing medical appointments, featuring distinct interfaces and functionalities for patients, doctors, and administrators.

The front-end is a dynamic single-page application (SPA) built with vanilla JavaScript, which communicates with two independent backend microservices (User Service and Appointment Service) via RESTful APIs.

## ✨ Features

* **Role-Based Access Control:** Three distinct user roles (`patient`, `doctor`, `admin`) with unique dashboards and permissions.
* **User Authentication:** Secure user registration and login.
* **Patient Dashboard:**
    * View a list of all available doctors and their specialties.
    * Book new appointments with a selected doctor.
    * View a list of all upcoming and past appointments.
    * Cancel a scheduled appointment.
* **Doctor Dashboard:**
    * View profile information, including specialty.
    * See a list of all appointments scheduled for them.
    * Cancel an upcoming appointment.
* **Admin Dashboard:**
    * View system-wide statistics (e.g., total patients, total doctors, appointment breakdowns).
    * See a list of all doctors in the system.

## 🏗️ Architecture

This project is built using a **Microservices Architecture** to separate concerns and ensure scalability.

* **Frontend (Single Page Application):**
    * A single `index.html` file serves as the entry point.
    * All UI rendering, state management, and API calls are handled by vanilla JavaScript (`app.js`).
    * Styling is provided by a clean, modern CSS file (`style.css`).

* **User Service (Backend):**
    * A Python/Flask microservice (`user_service.py`) that runs on `http://localhost:5001`.
    * Manages all user-related operations: registration, login, and fetching user data.
    * Maintains its own independent SQLite database (`users.db`).

* **Appointment Service (Backend):**
    * A Python/Flask microservice (`appointment_service.py`) that runs on `http://localhost:5002`.
    * Manages all appointment-related logic: booking, canceling, and listing appointments by user ID.
    * Maintains its own independent SQLite database (`appointments.db`).

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Backend:** Python, Flask, Flask-SQLAlchemy (for ORM), Flask-CORS
* **Database:** SQLite

## 🚀 Getting Started

To run this project locally, you will need to run all three components (the two backend services and the front-end) simultaneously.

### Prerequisites

* Python 3.x
* `pip` (Python package installer)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AnuragRai19/Smart-Appointment-Schedular.git](https://github.com/AnuragRai19/Smart-Appointment-Schedular.git)
    cd Smart-Appointment-Schedular
    ```

2.  **Install Python dependencies:**
    (These are imported in the service files: `flask`, `flask_sqlalchemy`, `flask_cors`, `werkzeug`)
    ```bash
    pip install Flask Flask-SQLAlchemy Flask-CORS werkzeug
    ```

### Running the Application

You will need **three separate terminals** open.

1.  **Terminal 1: Run the User Service**
    This service handles all user registration and logins.
    ```bash
    python user_service.py
    ```
    *Running on http://localhost:5001*

2.  **Terminal 2: Run the Appointment Service**
    This service handles all appointment booking and management.
    ```bash
    python appointment_service.py
    ```
    *Running on http://localhost:5002*

3.  **Terminal 3 (or Browser): Run the Frontend**
    The simplest way to run the frontend is to open the `index.html` file directly in your web browser.
    * Right-click `index.html` and choose "Open with" -> "Google Chrome" (or your preferred browser).
    * You can now register, log in, and use the application.

## 📖 API Endpoints (Service Contracts)

### User Service (`http://localhost:5001`)

* `POST /register`: Creates a new user (patient, doctor, or admin).
* `POST /login`: Authenticates a user and returns their data.
* `GET /doctors`: Returns a list of all users with the 'doctor' role.
* `GET /users`: Returns a list of all users in the system.

### Appointment Service (`http://localhost:5002`)

* `POST /appointments`: Books a new appointment.
* `GET /appointments`: Returns a list of all appointments (for admin).
* `PUT /appointments/<int:id>/cancel`: Updates an appointment's status to 'Canceled'.
* `GET /appointments/patient/<int:patient_id>`: Returns all appointments for a specific patient.
* `GET /appointments/doctor/<int:doctor_id>`: Returns all appointments for a specific doctor.
