// app.js

// Define the API endpoints for our services
const USER_SERVICE_URL = 'http://localhost:5001';
const APPOINTMENT_SERVICE_URL = 'http://localhost:5002';

// Get the main 'app' container
const app = document.getElementById('app');

// --- Helper Functions ---

// Function to save user data in browser session
function saveUserSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Function to get user data from session
function getUserSession() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Function to log out
function logout() {
    sessionStorage.removeItem('currentUser');
    showLoginPage();
}

// --- Page Rendering Functions ---

// Show Login Page
function showLoginPage() {
    app.innerHTML = `
        <div class="auth-page">
            <h1 class="auth-title">Smart Appointment Scheduler</h1>
            <div class="auth-card">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Sign In</button>
                </form>
                <p class="auth-switch" onclick="showRegisterPage()">Don't have an account? Register</p>
            </div>
        </div>
    `;

    // Add event listener for the form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // This is "Invoking a Service"
        const response = await fetch(`${USER_SERVICE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();
            saveUserSession(user);
            // Route to the correct dashboard based on role
            if (user.role === 'admin') showAdminDashboard();
            else if (user.role === 'doctor') showDoctorDashboard();
            else showPatientDashboard();
        } else {
            alert('Login failed. Please check credentials.');
        }
    });
}

// Show Register Page
function showRegisterPage() {
    app.innerHTML = `
        <div class="auth-page">
            <h1 class="auth-title">Smart Appointment Scheduler</h1>
            <div class="auth-card">
                <h2>Register</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input type="text" id="full_name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-group">
                        <label for="role">I am a:</label>
                        <select id="role" onchange="toggleSpecialty(this.value)">
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="form-group" id="specialty-group" style="display: none;">
                        <label for="specialty">Specialty</label>
                        <input type="text" id="specialty" placeholder="e.g., Cardiology">
                    </div>
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <p class="auth-switch" onclick="showLoginPage()">Already have an account? Login</p>
            </div>
        </div>
    `;
    
    // Add event listener
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            specialty: document.getElementById('specialty').value
        };

        // This is "Invoking a Service"
        const response = await fetch(`${USER_SERVICE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Registration successful! Please log in.');
            showLoginPage();
        } else {
            alert('Registration failed.');
        }
    });
}
// Helper for register form
function toggleSpecialty(role) {
    document.getElementById('specialty-group').style.display = (role === 'doctor') ? 'block' : 'none';
}

// --- Admin Dashboard (Matches UI) ---
async function showAdminDashboard() {
    // Invoke MULTIPLE services to build the dashboard
    const user = getUserSession();
    const apptsResponse = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments`);
    const doctorsResponse = await fetch(`${USER_SERVICE_URL}/doctors`);
    const patientsResponse = await fetch(`${USER_SERVICE_URL}/users`); // Simplified
    
    const allAppointments = await apptsResponse.json();
    const allDoctors = await doctorsResponse.json();
    const allPatients = (await patientsResponse.json()).filter(u => u.role === 'patient');

    const scheduled = allAppointments.filter(a => a.status === 'Scheduled').length;
    const canceled = allAppointments.filter(a => a.status === 'Canceled').length;

    app.innerHTML = `
        <div class="dashboard-page">
            ${renderHeader(user.full_name)}
            <div class="dashboard-content">
                <div class="stat-cards-container">
                    <div class="card stat-card">
                        <h3>Appointments Today</h3>
                        <span class="stat-number">${allAppointments.length}</span> </div>
                    <div class="card stat-card">
                        <h3>New Patients</h3>
                        <span class="stat-number">${allPatients.length}</span>
                    </div>
                    <div class="card stat-card">
                        <h3>Total Doctors</h3>
                        <span class="stat-number">${allDoctors.length}</span>
                    </div>
                </div>
                <div class="grid-container">
                    <div class="card">
                        <h3>Appointment Status Breakdown</h3>
                        <p>Scheduled: ${scheduled}</p>
                        <p>Canceled: ${canceled}</p>
                    </div>
                </div>
                <div class="card list-card">
                    <h3>Doctor Management</h3>
                    <table>
                        <thead><tr><th>Name</th><th>Speciality</th><th>Status</th></tr></thead>
                        <tbody id="doctor-list">
                            ${allDoctors.map(doc => `
                                <tr>
                                    <td>Dr. ${doc.full_name}</td>
                                    <td>${doc.specialty}</td>
                                    <td>Online</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// --- Doctor Dashboard (Matches UI) ---
async function showDoctorDashboard() {
    const user = getUserSession();
    
    // Invoke Appointment Service
    const response = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments/doctor/${user.id}`);
    const appointments = await response.json();

    app.innerHTML = `
        <div class="dashboard-page">
            ${renderHeader(user.full_name)}
            <div class="dashboard-content grid-container">
                <div class="card card-profile">
                    <h3>Dr. ${user.full_name}</h3>
                    <p>${user.specialty}</p>
                </div>
                <div class="card list-card">
                    <h3>Today's Appointments</h3>
                    <table>
                        <thead><tr><th>Time</th><th>Patient</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${appointments.map(appt => `
                                <tr>
                                    <td>${new Date(appt.datetime).toLocaleTimeString()}</td>
                                    <td>${appt.patient_name}</td>
                                    <td>${appt.status}</td>
                                    <td>
                                        ${appt.status === 'Scheduled' ? 
                                        `<button class="btn-cancel" onclick="cancelAppointment(${appt.id}, 'doctor')">Cancel</button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// --- Patient Dashboard (Matches UI) ---
async function showPatientDashboard() {
    const user = getUserSession();

    // Invoke MULTIPLE services
    const apptsResponse = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments/patient/${user.id}`);
    const doctorsResponse = await fetch(`${USER_SERVICE_URL}/doctors`);
    
    const appointments = await apptsResponse.json();
    const doctors = await doctorsResponse.json();

    app.innerHTML = `
        <div class="dashboard-page">
            ${renderHeader(user.full_name)}
            <div class="dashboard-content grid-container">
                <div class="card card-booking">
                    <h3>Book an Appointment</h3>
                    <form id="booking-form">
                        <div class="form-group">
                            <label for="doctor">Select Doctor</label>
                            <select id="doctor" required>
                                ${doctors.map(doc => `<option value="${doc.id}" data-name="Dr. ${doc.full_name}" data-specialty="${doc.specialty}">
                                    Dr. ${doc.full_name} (${doc.specialty})
                                </option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="date">Select Date & Time</label>
                            <input type="datetime-local" id="datetime" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Book Appointment</button>
                    </form>
                </div>
                <div class="card list-card">
                    <h3>Upcoming Appointments</h3>
                    <table>
                        <thead><tr><th>Doctor</th><th>Specialty</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${appointments.map(appt => `
                                <tr>
                                    <td>${appt.doctor_name}</td>
                                    <td>${appt.specialty}</td>
                                    <td>${new Date(appt.datetime).toLocaleString()}</td>
                                    <td>${appt.status}</td>
                                    <td>
                                        ${appt.status === 'Scheduled' ? 
                                        `<button class="btn-cancel" onclick="cancelAppointment(${appt.id}, 'patient')">Cancel</button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Add event listener for booking
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const doctorSelect = document.getElementById('doctor');
        const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
        
        const bookingData = {
            patient_id: user.id,
            doctor_id: document.getElementById('doctor').value,
            datetime: document.getElementById('datetime').value,
            // Add other data for display
            patient_name: user.full_name,
            doctor_name: selectedOption.getAttribute('data-name'),
            specialty: selectedOption.getAttribute('data-specialty')
        };

        const response = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            alert('Appointment booked!');
            showPatientDashboard(); // Refresh the dashboard
        } else {
            alert('Booking failed.');
        }
    });
}

// Function to render the common header


function renderHeader(username) {
    return `
        <header class="dashboard-header">
            <h1>Smart Appointment Scheduler</h1>
            <nav>
                <a class="nav-link" onclick="showMyDashboard()">Dashboard</a>
                <a class="nav-link" onclick="showSettingsPage()">Settings</a>
                <a class="logout-link" onclick="logout()">Logout (${username})</a>
            </nav>
        </header>
    `;
}

// Function to cancel an appointment (used by Patient and Doctor)
async function cancelAppointment(id, role) {
    const response = await fetch(`${APPOINTMENT_SERVICE_URL}/appointments/${id}/cancel`, {
        method: 'PUT'
    });
    if (response.ok) {
        alert('Appointment Canceled');
        // Refresh the appropriate dashboard
        if (role === 'patient') showPatientDashboard();
        else if (role === 'doctor') showDoctorDashboard();
    }
}

// --- Add this new function to app.js ---

function showSettingsPage() {
    const user = getUserSession();
    // Render the header and a new card for settings
    app.innerHTML = `
        <div class="dashboard-page">
            ${renderHeader(user.full_name)}
            <div class="dashboard-content">
                <div class="card" style="max-width: 600px; margin: auto;">
                    <h2>Settings</h2>
                    <p>This is where you could update your profile.</p>
                    
                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input type="text" id="full_name" value="${user.full_name}">
                    </div>
                    <div class="form-group">
                        <label for="email">Email (Cannot be changed)</label>
                        <input type="email" id="email" value="${user.email}" readonly>
                    </div>
                    <button class="btn btn-primary" onclick="alert('Update logic not implemented')">Update Profile</button>
                </div>
            </div>
        </div>
    `;
}


// --- Add this helper function to app.js ---

function showMyDashboard() {
    const user = getUserSession();
    if (user.role === 'admin') showAdminDashboard();
    else if (user.role === 'doctor') showDoctorDashboard();
    else showPatientDashboard();
}

// --- Initial App Load ---
// Check if user is already logged in, otherwise show login page
document.addEventListener('DOMContentLoaded', () => {
    const user = getUserSession();
    if (user) {
        if (user.role === 'admin') showAdminDashboard();
        else if (user.role === 'doctor') showDoctorDashboard();
        else showPatientDashboard();
    } else {
        showLoginPage();
    }
});