const date = new Date();
let events = [];
let selectedDate = null;

// ☁️ MOCK CLOUD DATABASE (No Login Required)
const API_URL = "https://jsonblob.com/api/jsonBlob/1342838964998340608";

// Load events from Cloud
const loadEvents = async () => {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            events = await res.json();
            renderCalendar();
        }
    } catch (err) {
        console.error("Failed to load events:", err);
    }
};

// Save events to Cloud
const saveEventsToStorage = async () => {
    try {
        await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(events)
        });
        console.log("Saved to cloud!");
    } catch (err) {
        console.error("Failed to save events:", err);
    }
};

const renderCalendar = () => {
    date.setDate(1);

    const monthDays = document.querySelector(".days");

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    const firstDayIndex = date.getDay();
    const lastDayIndex = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();

    const nextDays = 7 - lastDayIndex - 1;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    document.querySelector("#current-month").innerHTML = `${months[date.getMonth()]} ${date.getFullYear()}`;

    let days = "";

    // Previous month days
    for (let x = firstDayIndex; x > 0; x--) {
        days += `<div class="day inactive"><span class="day-number">${prevLastDay - x + 1}</span></div>`;
    }

    // Current month days
    for (let i = 1; i <= lastDay; i++) {
        const currentDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === currentDateStr);
        let eventDots = dayEvents.map(() => `<div class="event-dot"></div>`).join('');

        const isToday = i === new Date().getDate() && date.getMonth() === new Date().getMonth();
        const dayClass = isToday ? "day today" : "day";

        days += `<div class="${dayClass}" onclick="openModal('${currentDateStr}')">
                    <span class="day-number">${i}</span>
                    <div class="dots-container">${eventDots}</div>
                 </div>`;
    }

    // Next month days
    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="day inactive"><span class="day-number">${j}</span></div>`;
    }

    monthDays.innerHTML = days;
    updateUpcomingEvents();
};

// Modal Logic
const modal = document.getElementById("event-modal");
const closeBtn = document.querySelector(".close-btn");
const eventForm = document.getElementById("event-form");

const openModal = (dateStr) => {
    selectedDate = dateStr;
    if (modal) modal.classList.remove("hidden");
};

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

if (eventForm) {
    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("event-title").value;
        const time = document.getElementById("event-time").value;

        if (title && time && selectedDate) {
            events.push({
                date: selectedDate,
                title: title,
                time: time,
                type: 'session'
            });

            await saveEventsToStorage(); // Save to Cloud

            // Reset form
            eventForm.reset();
            modal.classList.add("hidden");

            // Re-render calendar
            renderCalendar();
        }
    });
}

const updateUpcomingEvents = () => {
    const eventList = document.querySelector(".event-list");
    if (!eventList) return;

    // Sort events by date/time
    const sortedEvents = [...events].sort((a, b) => {
        return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
    });

    eventList.innerHTML = sortedEvents.slice(0, 5).map(event => `
        <li>
            <span class="event-time">${event.time}</span>
            <span class="event-title">${event.title}</span>
            <span class="event-date" style="font-size: 0.8rem; color: var(--text-secondary); margin-left: auto;">${event.date}</span>
        </li>
    `).join('');
};

// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
}

const prevBtn = document.querySelector("#prev-month");
const nextBtn = document.querySelector("#next-month");

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });
}

// Initial Load
loadEvents();

// Poll for updates every 5 seconds (Simulate Real-Time)
setInterval(loadEvents, 5000);
