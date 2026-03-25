// Scroll Animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

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
    const nextBtns = document.querySelectorAll('.btn-next');
    const backBtns = document.querySelectorAll('.back-btn');

    nextBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextStepId = e.currentTarget.getAttribute('data-next');
            if(!nextStepId) return;
            
            const currentStep = document.querySelector('.b-step.active');
            const nextStep = document.getElementById(nextStepId);
            
            if (currentStep && nextStep) {
                currentStep.classList.remove('active');
                currentStep.classList.add('slide-out');
                setTimeout(() => currentStep.classList.remove('slide-out'), 400);
                
                nextStep.classList.add('active');
            }
            
            if(nextStepId === 'step3') generateTimeSlots();
            if(nextStepId === 'step4') updateSummary();
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const backStepId = e.currentTarget.getAttribute('data-back');
            if(!backStepId) return;
            
            const currentStep = document.querySelector('.b-step.active');
            const backStep = document.getElementById(backStepId);
            
            if (currentStep && backStep) {
                currentStep.classList.remove('active');
                backStep.classList.add('active');
            }
        });
    });

    // Step 3: Date & Time
    const dateInput = document.getElementById('booking-date');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const confirmTimeBtn = document.getElementById('confirmTimeBtn');

    const today = new Date().toISOString().split('T')[0];
    if(dateInput) {
        dateInput.setAttribute('min', today);
        dateInput.value = today;
        dateInput.addEventListener('change', generateTimeSlots);
    }

    function generateTimeSlots() {
        if (!timeSlotsContainer) return;
        timeSlotsContainer.innerHTML = '';
        if (confirmTimeBtn) confirmTimeBtn.disabled = true;
        
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
                    timeSlotsContainer.dataset.selectedTime = time;
                    if (confirmTimeBtn) confirmTimeBtn.disabled = false;
                });
            }
            timeSlotsContainer.appendChild(slot);
        });
    }

    // Step 4: Summary 
    function updateSummary() {
        const selectedService = document.querySelector('input[name="service"]:checked')?.value || 'N/A';
        const selectedBarber = document.querySelector('input[name="barber"]:checked')?.value || 'N/A';
        const selectedDate = dateInput ? dateInput.value : 'N/A';
        const selectedTime = timeSlotsContainer?.dataset.selectedTime || 'N/A';
        
        const summaryService = document.getElementById('summaryService');
        const summaryBarber = document.getElementById('summaryBarber');
        const summaryTime = document.getElementById('summaryTime');

        if(summaryService) summaryService.innerHTML = `Service: <span>${selectedService}</span>`;
        if(summaryBarber) summaryBarber.innerHTML = `Barber: <span>${selectedBarber}</span>`;
        if(summaryTime) summaryTime.innerHTML = `Time: <span>${selectedDate} at ${selectedTime}</span>`;
    }
});
