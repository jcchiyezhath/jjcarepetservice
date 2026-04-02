document.addEventListener("DOMContentLoaded", () => {
  loadAllData();
});

 const SHEETS = {
  vets: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5uhHEwCM8LxxaiOda5CKO4qOXK1538pAHjfcoQEQ5ilJMEEknaDiV7CA2Y8TrnsIOX12YMj7ptko/pub?gid=0&single=true&output=csv",
  dogParks: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5uhHEwCM8LxxaiOda5CKO4qOXK1538pAHjfcoQEQ5ilJMEEknaDiV7CA2Y8TrnsIOX12YMj7ptko/pub?gid=56331126&single=true&output=csv",
  services: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5uhHEwCM8LxxaiOda5CKO4qOXK1538pAHjfcoQEQ5ilJMEEknaDiV7CA2Y8TrnsIOX12YMj7ptko/pub?gid=2052053281&single=true&output=csv",
  testimonials: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5uhHEwCM8LxxaiOda5CKO4qOXK1538pAHjfcoQEQ5ilJMEEknaDiV7CA2Y8TrnsIOX12YMj7ptko/pub?gid=1441070019&single=true&output=csv",
  emergency: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5uhHEwCM8LxxaiOda5CKO4qOXK1538pAHjfcoQEQ5ilJMEEknaDiV7CA2Y8TrnsIOX12YMj7ptko/pub?gid=1733043372&single=true&output=csv"
};

const BUSINESS_INFO = {
  name: "JJ Care Pet Service",
  tagline: "Safe, loving care for your pets",
  location: "Saint Cloud, FL",
  email: "jjcarepetservice@gmail.com"
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      if (cell.length > 0 || row.length > 0) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = "";
      }
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());

  return rows
    .slice(1)
    .filter((r) => r.some((v) => v !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim().toLowerCase()] = (r[i] || "").trim();
      });
      return obj;
    });
}

async function loadSheet(url) {
  const res = await fetch(url + "&t=" + Date.now());
  const text = await res.text();
  return parseCSV(text);
}

async function loadAllData() {
  try {
    const [vets, dogParks, services, testimonials, emergency] = await Promise.all([
  loadSheet(SHEETS.vets),
  loadSheet(SHEETS.dogParks),
  loadSheet(SHEETS.services),
  loadSheet(SHEETS.testimonials),
  loadSheet(SHEETS.emergency)
]);

    loadBusinessInfo(BUSINESS_INFO);
    loadServices(services);
    loadDogParks(dogParks);
    loadVets(vets);
    loadTestimonials(testimonials);
    loadEmergency(emergency);
    startTestimonialsAutoScroll();

    console.log("Vets:", vets);
    console.log("Dog Parks:", dogParks);
    console.log("Services:", services);
    console.log("Testimonials:", testimonials);
  } catch (err) {
    console.error("Error loading content:", err);
  }
}

function loadEmergency(items) {
  const container = document.getElementById("emergency-list");
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "guide-item";

    div.innerHTML = `
      <div class="guide-item-top">
        <h3>${item.name}</h3>
        <span class="guide-tag">Emergency</span>
      </div>
      <p><strong>Phone:</strong> ${makePhoneLink(item.phone)}</p>
      <p>${item.notes}</p>
      <a href="${item.map}" target="_blank" class="btn btn-secondary">View on Maps</a>
    `;

    container.appendChild(div);
  });
}

function loadBusinessInfo(business) {
  setText("business-name", business.name);
  setText("tagline", business.tagline);
  setText("location", `Location ${business.location}`);
  setText("phone", `Phone ${business.phone}`);
  setText("email", `Email ${business.email}`);

  setText("footer-business-name", business.name);
  setText("footer-location", business.location);
  setText("footer-email", business.email);
}

function loadServices(services) {
  const container = document.getElementById("services-list");
  if (!container) return;

  container.innerHTML = "";

  services.forEach((service) => {
    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="service-price">${service.price}</div>
    `;

    container.appendChild(div);
  });
}

function loadDogParks(parks) {
  const container = document.getElementById("dog-parks-list");
  if (!container) return;

  container.innerHTML = "";

  parks.forEach((park) => {
    const div = document.createElement("div");
    div.className = "guide-item";

    div.innerHTML = `
      <div class="guide-item-top">
        <h3>${park.name}</h3>
        <span class="guide-tag">Dog Park</span>
      </div>
      <p><strong>Address:</strong> ${park.address}</p>
      <p>${park.notes}</p>
      <a href="${park.map}" target="_blank" class="btn btn-secondary">View on Maps</a>
    `;

    container.appendChild(div);
  });
}

function loadVets(vets) {
  const container = document.getElementById("vets-list");
  if (!container) return;

  container.innerHTML = "";

  vets.forEach((vet) => {
    const div = document.createElement("div");
    div.className = "guide-item";

    div.innerHTML = `
      <div class="guide-item-top">
        <h3>${vet.name}</h3>
        <span class="guide-tag">Vet</span>
      </div>
      <p><strong>Phone:</strong> ${makePhoneLink(vet.phone)}</p>
      <p>${vet.notes}</p>
      <a href="${vet.map}" target="_blank" class="btn btn-secondary">View on Maps</a>
    `;

    container.appendChild(div);
  });
}

function loadTestimonials(testimonials) {
  const container = document.getElementById("testimonials-list");
  if (!container) return;

  container.innerHTML = "";

  testimonials.forEach((t) => {
    const div = document.createElement("div");
    div.className = "testimonial";

    div.innerHTML = `
      <p>"${t.text}"</p>
      <h4>${t.name}</h4>
    `;

    container.appendChild(div);
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function makePhoneLink(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  return `<a href="tel:${cleaned}">${phone}</a>`;
}


function startTestimonialsAutoScroll() {
  const container = document.getElementById("testimonials-list");
  if (!container) return;

  let interval;
  let userInteracting = false;
  let resumeTimeout;

  function start() {
    interval = setInterval(() => {
      if (userInteracting) return;

      const card = container.querySelector(".testimonial");
      if (!card) return;

      const scrollAmount = card.offsetWidth + 16;

      const nearEnd =
        container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

      if (nearEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3000);
  }

  function stop() {
    clearInterval(interval);
  }

  function userScrollDetected() {
    userInteracting = true;
    stop();

    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      userInteracting = false;
      start();
    }, 4000); // resumes after 4 seconds
  }

  // Desktop hover
  container.addEventListener("mouseenter", stop);
  container.addEventListener("mouseleave", start);

  // Mobile touch
  container.addEventListener("touchstart", userScrollDetected);
  container.addEventListener("touchend", userScrollDetected);

  // Manual scroll (VERY IMPORTANT)
  container.addEventListener("scroll", userScrollDetected);

  start();
}

const form = document.getElementById("contactForm");
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzwTNvJuRplw9VfFrSOpmEozM9ufuA6YZ1NMYM_lZIeupxyHrQaEsC_McVrcKI2uL2f/exec";

if (form) {
  form.addEventListener("submit", async function (e) {
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Sending...";
    e.preventDefault();

    const formData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value
    };

    const status = document.getElementById("form-status");
    if (status) {
      status.style.display = "none";
      status.textContent = "";
    }

    try {
      await fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (status) {
        status.style.display = "block";
        status.textContent = "Message sent successfully!";
      }

      form.reset();
      button.disabled = false;
      button.textContent = "Send Message";
    } catch (error) {
      if (status) {
        status.style.display = "block";
        status.textContent = "There was a problem sending your message.";
      }

      button.disabled = false;
      button.textContent = "Send Message";

      console.error(error);
    }
  });
}

const bookingForm = document.getElementById("booking-form");
const BOOKING_FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxQ6fwXwnB_PaDuH7TVm5fx2lLYZKrMEXeQ8gpJYsb8z3MPahgODByO6dor6WhqwkWr/exec";

if (bookingForm) {
  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const button = bookingForm.querySelector("button[type='submit']") || bookingForm.querySelector("button");
    const status = document.getElementById("success-message");

    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }
    if (status) {
      status.style.display = "none";
    }

    const formData = new FormData(bookingForm);

    try {
      await fetch(BOOKING_FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(formData)
      });

      bookingForm.reset();
      if (status) {
        status.style.display = "block";
        status.textContent = "Request submitted! We’ll contact you shortly.";
      }
    } catch (error) {
      if (status) {
        status.style.display = "block";
        status.textContent = "There was a problem submitting your request.";
      }
      console.error(error);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Submit Request";
      }
    }
  });
}
