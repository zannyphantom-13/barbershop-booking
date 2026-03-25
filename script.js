import { db, ref, get, set } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
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
                
                const timeSlotsContainer = document.getElementById('timeSlots');
                const selectedTime = timeSlotsContainer?.dataset.selectedTime || '';
                const dateInput = document.getElementById('booking-date');
                
                const newBookingId = 'bk_' + Date.now();
                bookings[newBookingId] = {
                    name, phone, email,
                    service: document.querySelector('input[name="service"]:checked')?.value || '',
                    barber: document.querySelector('input[name="barber"]:checked')?.value || '',
                    time: `${dateInput?.value} at ${selectedTime}`,
                    status: 'pending',
                    timestamp: Date.now()
                };
                
                await set(bookingsRef, bookings);
                
                // Trigger Confirmation Email via EmailJS
                try {
                    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                        client_name: name,
                        client_email: email,
                        booking_id: newBookingId,
                        service: bookings[newBookingId].service,
                        time: bookings[newBookingId].time,
                        barber: bookings[newBookingId].barber,
                        type: "Booking Confirmation"
                    }).then(() => console.log("Confirmation email sent."))
                      .catch(err => console.error("Email error:", err));
                } catch (emailErr) {
                    console.error("Failed executing EmailJS send code.", emailErr);
                }

                const currentStep = document.querySelector('.b-step.active');
                if(currentStep) {
                    currentStep.classList.remove('active');
                    currentStep.classList.add('slide-out');
                    setTimeout(() => currentStep.classList.remove('slide-out'), 400);
                }
                
                const successStep = document.getElementById('stepSuccess');
                if(successStep) successStep.classList.add('active');
            } catch (err) {
                console.error("Booking Error:", err);
                alert("Error syncing with Vercel/Firebase. Please try again.");
                finalSubmitBtn.innerText = "Confirm Booking";
                finalSubmitBtn.disabled = false;
            }
        });
    }
});
