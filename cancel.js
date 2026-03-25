import { db, ref, get, set } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // If there's an ID in the URL (?id=bk_1234), prefill it
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    if (idParam) {
        document.getElementById('cancelBookingId').value = idParam;
    }

    const cancelBtn = document.getElementById('cancelBtn');
    
    cancelBtn.addEventListener('click', async () => {
        const bookingId = document.getElementById('cancelBookingId').value.trim();
        const email = document.getElementById('cancelEmail').value.trim();
        const feedback = document.getElementById('cancelFeedback');
        
        feedback.style.display = 'none';

        if (!bookingId || !email) {
            feedback.innerText = "Please provide both Booking ID and Email.";
            feedback.style.display = 'block';
            return;
        }
        
        cancelBtn.innerText = "Processing...";
        cancelBtn.disabled = true;

        try {
            const bookingsRef = ref(db, 'barber_bookings');
            const snapshot = await get(bookingsRef);
            
            if (!snapshot.exists()) {
                throw new Error("No bookings found.");
            }
            
            const bookings = snapshot.val();
            const booking = bookings[bookingId];
            
            if (!booking) {
                feedback.innerText = "Booking ID not found.";
                feedback.style.display = 'block';
                return resetBtn();
            }

            if (booking.email.toLowerCase() !== email.toLowerCase()) {
                feedback.innerText = "Email does not match the booking.";
                feedback.style.display = 'block';
                return resetBtn();
            }

            if (booking.status === 'cancelled') {
                feedback.innerText = "This booking is already cancelled.";
                feedback.style.display = 'block';
                return resetBtn();
            }

            // Update status to cancelled
            booking.status = 'cancelled';
            bookings[bookingId] = booking;
            await set(bookingsRef, bookings);

            // Send EmailJS Cancellation Notice
            emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                client_name: booking.name,
                client_email: booking.email,
                booking_id: bookingId,
                service: booking.service,
                time: booking.time,
                barber: booking.barber,
                type: "Cancellation Notice"
            }).then(() => {
                console.log("Cancellation email sent.");
            }).catch(err => {
                console.error("Failed to send cancellation email.", err);
            });

            // Show success screen
            document.getElementById('cancelStep').classList.remove('active');
            document.getElementById('cancelSuccess').classList.add('active');

        } catch (err) {
            console.error("Cancellation Error:", err);
            feedback.innerText = "Error completing cancellation. Please try again later.";
            feedback.style.display = 'block';
            resetBtn();
        }
    });

    function resetBtn() {
        cancelBtn.innerText = "Confirm Cancellation";
        cancelBtn.disabled = false;
    }
});
