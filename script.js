import { db, ref, get, set } from './firebase-config.js';

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if(this.getAttribute('href') !== '#') {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Bento Booking Logic
const steps = document.querySelectorAll('.b-step');
const nextBtns = document.querySelectorAll('.next-btn');
const backBtns = document.querySelectorAll('.back-btn');

nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const nextStepId = e.target.getAttribute('data-next');
        if(!nextStepId) return;
        
        const currentStep = document.querySelector('.b-step.active');
        const nextStep = document.getElementById(nextStepId);
        
        currentStep.classList.remove('active');
        currentStep.classList.add('slide-out');
        setTimeout(() => currentStep.classList.remove('slide-out'), 400);
        
        nextStep.classList.add('active');
        
        if(nextStepId === 'step3') generateTimeSlots();
        if(nextStepId === 'step4') updateSummary();
    });
});

backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const backStepId = e.target.getAttribute('data-back');
        if(!backStepId) return;
        
        const currentStep = document.querySelector('.b-step.active');
        const backStep = document.getElementById(backStepId);
        
        currentStep.classList.remove('active');
        backStep.classList.add('active');
    });
});

// Step 3: Date & Time
const dateInput = document.getElementById('booking-date');
const timeSlotsContainer = document.getElementById('timeSlots');
const confirmTimeBtn = document.getElementById('confirmTimeBtn');
let selectedTime = null;

const today = new Date().toISOString().split('T')[0];
if(dateInput) {
    dateInput.setAttribute('min', today);
    dateInput.value = today;
    dateInput.addEventListener('change', generateTimeSlots);
}

function generateTimeSlots() {
    timeSlotsContainer.innerHTML = '';
    confirmTimeBtn.disabled = true;
    selectedTime = null;
    
    const times = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
    
    times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerText = time;
        
        if(Math.random() < 0.2) {
            slot.classList.add('booked');
        } else {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTime = time;
                confirmTimeBtn.disabled = false;
            });
        }
        timeSlotsContainer.appendChild(slot);
    });
}

// Step 4: Summary & Firebase Injection
function updateSummary() {
    const selectedService = document.querySelector('input[name="service"]:checked').value;
    const selectedBarber = document.querySelector('input[name="barber"]:checked').value;
    const selectedDate = dateInput.value;
    
    document.getElementById('summaryService').innerText = `Service: ${selectedService}`;
    document.getElementById('summaryBarber').innerText = `Barber: ${selectedBarber}`;
    document.getElementById('summaryTime').innerText = `Time: ${selectedDate} at ${selectedTime}`;
}

const finalSubmitBtn = document.getElementById('finalSubmitBtn');
if(finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', async () => {
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const email = document.getElementById('clientEmail').value;
        
        if(!name || !phone || !email) return alert("Please fill in all contact details.");
        
        finalSubmitBtn.innerText = "Processing...";
        finalSubmitBtn.disabled = true;
        
        try {
            const bookingsRef = ref(db, 'barber_bookings');
            const snapshot = await get(bookingsRef);
            const bookings = snapshot.exists() ? snapshot.val() : {};
            
            const newBookingId = 'bk_' + Date.now();
            bookings[newBookingId] = {
                name, phone, email,
                service: document.getElementById('summaryService').innerText.replace('Service: ', ''),
                barber: document.getElementById('summaryBarber').innerText.replace('Barber: ', ''),
                time: document.getElementById('summaryTime').innerText.replace('Time: ', ''),
                status: 'pending',
                timestamp: Date.now()
            };
            
            await set(bookingsRef, bookings);
            
            const currentStep = document.querySelector('.b-step.active');
            currentStep.classList.remove('active');
            currentStep.classList.add('slide-out');
            setTimeout(() => currentStep.classList.remove('slide-out'), 400);
            
            document.getElementById('stepSuccess').classList.add('active');
        } catch (err) {
            console.error("Booking Error:", err);
            alert("Error syncing with Vercel/Firebase. Please try again.");
            finalSubmitBtn.innerText = "Confirm Booking";
            finalSubmitBtn.disabled = false;
        }
    });
}
