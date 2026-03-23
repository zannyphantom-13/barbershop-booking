import { db, ref, get, set, onValue } from './firebase-config.js';

// Authentication Logic
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');

function checkAuth() {
    if (sessionStorage.getItem('barberAdminAuth') === 'true') {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        initDashboard();
    }
}

document.getElementById('loginBtn').addEventListener('click', () => {
    const errorMsg = document.getElementById('loginError');
    if (document.getElementById('adminPassword').value === 'admin123') {
        sessionStorage.setItem('barberAdminAuth', 'true');
        checkAuth();
    } else {
        errorMsg.textContent = 'Incorrect password.';
        errorMsg.style.display = 'block';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('barberAdminAuth');
    location.reload();
});

// Dashboard Logic
let bookingsData = {};
let currentFilter = 'pending';

function initDashboard() {
    const bookingsRef = ref(db, 'barber_bookings');
    
    onValue(bookingsRef, (snapshot) => {
        bookingsData = snapshot.exists() ? snapshot.val() : {};
        renderTable();
    });
}

function renderTable() {
    const tbody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    tbody.innerHTML = '';
    
    // Convert object to array and sort by newest first (using timestamp)
    let bookingsArray = Object.keys(bookingsData).map(key => ({
        id: key,
        ...bookingsData[key]
    })).sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply Filters
    if (currentFilter !== 'all') {
        bookingsArray = bookingsArray.filter(b => b.status === currentFilter);
    }
    
    // Update Stats
    const pendingCount = Object.values(bookingsData).filter(b => b.status === 'pending').length;
    document.getElementById('statPending').textContent = pendingCount;
    
    // Render
    if(bookingsArray.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        bookingsArray.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${b.time}</strong><br><small style="color:var(--text-muted)">${new Date(b.timestamp).toLocaleDateString()}</small></td>
                <td>${b.name}</td>
                <td>${b.phone}<br><small style="color:var(--text-muted)">${b.email}</small></td>
                <td>${b.service}</td>
                <td>${b.barber}</td>
                <td><span class="status-badge ${b.status}">${b.status}</span></td>
                <td>
                    ${b.status === 'pending' ? `<button class="action-btn complete-btn" data-id="${b.id}">✓ Complete</button>` : ''}
                    <button class="action-btn del del-btn" data-id="${b.id}">🗑 Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Bind Actions
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(btn.dataset.id, 'complete'));
        });
        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteBooking(btn.dataset.id));
        });
    }
}

async function updateStatus(id, newStatus) {
    if(confirm('Mark this appointment as complete?')) {
        bookingsData[id].status = newStatus;
        await set(ref(db, 'barber_bookings'), bookingsData);
    }
}

async function deleteBooking(id) {
    if(confirm('Delete this booking permanently?')) {
        delete bookingsData[id];
        await set(ref(db, 'barber_bookings'), Object.keys(bookingsData).length ? bookingsData : null);
    }
}

// Filter Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTable();
    });
checkAuth();

// Mobile Sidebar Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');

if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    // Auto-close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
            sidebar.classList.remove('show');
        }
    });
}
