// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if(this.getAttribute('href') !== '#') {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Booking Logic
const steps = document.querySelectorAll('.booking-step');
const nextBtns = document.querySelectorAll('.next-btn');
const backBtns = document.querySelectorAll('.back-btn');

// Navigate Next
nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const nextStepId = e.target.getAttribute('data-next');
        if(!nextStepId) return;
        
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        // Show next step
        document.getElementById(nextStepId).classList.add('active');
        
        // Custom logic per step
        if(nextStepId === 'step3') generateTimeSlots();
        if(nextStepId === 'step4') updateSummary();
    });
});

// Navigate Back
backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const backStepId = e.target.getAttribute('data-back');
        if(!backStepId) return;
        
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        // Show previous step
        document.getElementById(backStepId).classList.add('active');
    });
});

// Date & Time Logic (Step 3)
const dateInput = document.getElementById('booking-date');
const timeSlotsContainer = document.getElementById('timeSlots');
const confirmTimeBtn = document.getElementById('confirmTimeBtn');
let selectedTime = null;

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
dateInput.value = today;

dateInput.addEventListener('change', generateTimeSlots);

function generateTimeSlots() {
    timeSlotsContainer.innerHTML = '';
    confirmTimeBtn.disabled = true;
    selectedTime = null;
    
    // Generate dummy times 9 AM to 5 PM
    const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
                   "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", 
                   "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"];
    
    times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerText = time;
        
        // Randomly make some slots unavailable to simulate real booking
        if(Math.random() < 0.3) {
            slot.classList.add('booked');
        } else {
            slot.addEventListener('click', () => {
                // Deselect others
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                // Select this
                slot.classList.add('selected');
                selectedTime = time;
                confirmTimeBtn.disabled = false;
            });
        }
        
        timeSlotsContainer.appendChild(slot);
    });
}

// Update Summary (Step 4)
function updateSummary() {
    // Get Service Name
    const selectedServiceValue = document.querySelector('input[name="service"]:checked').value;
    const serviceLabels = {
        'haircut': 'Classic Haircut',
        'shave': 'Hot Towel Shave',
        'beard': 'Beard Trim',
        'executive': 'Executive Package'
    };
    document.getElementById('summaryService').innerText = `Service: ${serviceLabels[selectedServiceValue]}`;
    
    // Get Barber Name
    const selectedBarberValue = document.querySelector('input[name="barber"]:checked').value;
    const barberLabels = {
        'jay': 'Jay (Owner / Master)',
        'marcus': 'Marcus (Senior Barber)',
        'leo': 'Leo (Fade Specialist)',
        'any': 'Any Available Barber'
    };
    document.getElementById('summaryBarber').innerText = `Barber: ${barberLabels[selectedBarberValue]}`;
    
    // Get Date and Time
    const selectedDate = dateInput.value;
    document.getElementById('summaryTime').innerText = `Time: ${selectedDate} at ${selectedTime}`;
}

// Final Submit Simulation
document.getElementById('finalSubmitBtn').addEventListener('click', () => {
    // Basic validation
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    
    if(!name || !phone || !email) {
        alert("Please fill in all details.");
        return;
    }
    
    // Simulate API call
    const btn = document.getElementById('finalSubmitBtn');
    btn.innerText = "Processing...";
    btn.disabled = true;
    
    setTimeout(() => {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById('stepSuccess').classList.add('active');
    }, 1500);
});
