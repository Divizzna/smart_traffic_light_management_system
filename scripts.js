// Global cart
let cart = [];

// Simple "database" using browser localStorage
let bookingsData = JSON.parse(localStorage.getItem('eventPlanersBookings') || '[]');
let feedbackData = JSON.parse(localStorage.getItem('eventPlanersFeedback') || '[]');

// Render cart in both preview (services) and booking table
function renderCart() {
  const cartCountSpan = document.getElementById('cartCount');
  const cartTotalPreview = document.getElementById('cartTotalPreview');
  const cartBody = document.getElementById('cartBody');
  const cartTotalSpan = document.getElementById('cartTotal');

  let total = 0;

  if (cartBody) {
    cartBody.innerHTML = '';
  }

  cart.forEach((item, index) => {
    total += item.price;

    if (cartBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.price.toLocaleString('en-IN')}</td>
      `;
      cartBody.appendChild(tr);
    }
  });

  const formattedTotal = '₹' + total.toLocaleString('en-IN');

  if (cartCountSpan) cartCountSpan.textContent = cart.length.toString();
  if (cartTotalPreview) cartTotalPreview.textContent = formattedTotal;
  if (cartTotalSpan) cartTotalSpan.textContent = formattedTotal;
}

// Add to cart (logic only)
function addToCart(name, price) {
  const p = parseInt(price, 10) || 0;
  cart.push({ name, price: p });
  renderCart();
}

// Smooth scroll helper
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// Helper to download a text file
function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Add-to-cart buttons
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;

      if (btn.classList.contains('added')) return;

      addToCart(name, price);

      btn.classList.add('added');
      btn.textContent = 'Added';
      btn.disabled = true;
    });
  });

  // Proceed to booking from services
  const goToBookingBtn = document.getElementById('goToBookingBtn');
  if (goToBookingBtn) {
    goToBookingBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Please add at least one service to the cart before going to booking.');
        return;
      }
      renderCart();
      scrollToId('booking');
    });
  }

  // Booking form
 // Booking form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const eventDate = document.getElementById('eventDate').value;

    let errors = '';
if (cart.length === 0) errors += '- Cart is empty\n';
if (!name) errors += '- Name required\n';

if (!phone) {
  errors += '- Phone required\n';
} else if (!/^[6-9]\d{9}$/.test(phone)) {
  errors += '- Phone number must be 10 digits and start with 6–9\n';
}

if (!email) {
  errors += '- Email required\n';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  errors += '- Invalid email format\n';
}
if (!address) errors += '- Address required\n';
if (!eventDate) errors += '- Event date required\n';

if (errors) {
  alert(errors);
  return;
}


    let total = 0;
    cart.forEach(item => total += item.price);

    // ✅ DEFINE bookingRecord (MISSING BEFORE)
    const bookingRecord = {
      name,
      phone,
      email,
      address,
      eventDate,
      services: cart,
      total
    };

    fetch('http://localhost:3000/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingRecord)
    })
      .then(res => res.json())
      .then(data => {
        alert('Booking confirmed!');
        bookingsData.push(bookingRecord);
        localStorage.setItem(
          'eventPlanersBookings',
          JSON.stringify(bookingsData)
        );
        bookingForm.reset();
        cart = [];
        renderCart();
      })
      .catch(err => {
        console.error('Booking save failed', err);
        alert('Booking failed!');
      });
  });
}

localStorage.setItem('eventPlanersBookings', JSON.stringify(bookingsData));

    

  // Feedback form
  // Feedback form
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fbName').value.trim();
    const email = document.getElementById('fbEmail').value.trim();
    const phone = document.getElementById('fbPhone').value.trim();
    const services = document.getElementById('fbService').value.trim();
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const msg = document.getElementById('fbMsg').value.trim();
    let errors = '';
if (!name) errors += '- Name required\n';
if (!email) {
  errors += '- Email required\n';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  errors += '- Invalid email format\n';
}
if (!phone) {
  errors += '- Mobile number required\n';
} else if (!/^[6-9]\d{9}$/.test(phone)) {
  errors += '- Mobile number must be 10 digits and start with 6–9\n';
}

if (!services) errors += '- Service required\n';
if (!ratingEl) errors += '- Rating required\n';
if (!msg) errors += '- Message required\n';

if (errors) {
  alert(errors);
  return;
}



    // ✅ DEFINE feedbackRecord (missing earlier)
    const feedbackRecord = {
      name,
      email,
      phone,
      services,
      rating: ratingEl.value,
      message: msg,
      date: new Date().toISOString()
    };

    fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackRecord)
    })
      .then(res => res.json())
      .then(data => {
        alert('Feedback submitted successfully!');
        feedbackData.push(feedbackRecord);
        localStorage.setItem(
          'eventPlanersFeedback',
          JSON.stringify(feedbackData)
        );
        feedbackForm.reset();
      })
      .catch(err => {
        console.error('Feedback save failed', err);
        alert('Feedback failed!');
      });
  });
}


  // Download booking data
  const downloadBookingsBtn = document.getElementById('downloadBookingsBtn');
  if (downloadBookingsBtn) {
    downloadBookingsBtn.addEventListener('click', () => {
      if (bookingsData.length === 0) {
        alert('No booking data found yet.');
        return;
      }
      downloadTextFile('booking_details.txt', JSON.stringify(bookingsData, null, 2));
    });
  }

  // Download feedback data
  const downloadFeedbackBtn = document.getElementById('downloadFeedbackBtn');
  if (downloadFeedbackBtn) {
    downloadFeedbackBtn.addEventListener('click', () => {
      if (feedbackData.length === 0) {
        alert('No feedback data found yet.');
        return;
      }
      downloadTextFile('feedback_details.txt', JSON.stringify(feedbackData, null, 2));
    });
  }

  // ================= ADMIN VISIBILITY (ADDED) =================
  if (localStorage.getItem('eventPlanersAdmin') === 'true') {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'block';
    });
  }

});
