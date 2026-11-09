(() => {
  const EDITS_KEY = "mohamed-therapy-page-edits";
  const BOOKINGS_KEY = "mohamed-therapy-booking-requests";
  const editableSelector = "h1, h2, h3, .hero__intro, .intro__main > p, .support-card p, .support-card h3, .step h3, .step p, .about-copy > p:not(.eyebrow), .faq-list summary, .faq-list details p, .contact-wrap h2, .contact-wrap > div > p:last-child, .footer-note";
  const editableElements = [...document.querySelectorAll(editableSelector)];
  const editorToggle = document.getElementById("editor-toggle");
  const editorPanel = document.getElementById("editor-panel");
  const bookingsContainer = document.getElementById("editor-bookings");
  const toast = document.getElementById("toast");
  const form = document.getElementById("booking-form");
  let toastTimer;

  document.getElementById("year").textContent = new Date().getFullYear();

  try {
    const savedEdits = JSON.parse(localStorage.getItem(EDITS_KEY) || "[]");
    savedEdits.forEach((value, index) => {
      if (editableElements[index] && typeof value === "string") editableElements[index].innerHTML = value;
    });
  } catch (error) {
    console.error("Could not load saved page edits.", error);
  }

  const dateInput = document.getElementById("preferred-date");
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function toggleEditor(forceOpen) {
    const isOpen = forceOpen ?? editorPanel.hidden;
    editorPanel.hidden = !isOpen;
    editorToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) setEditing(false);
  }

  function setEditing(enabled) {
    editableElements.forEach((element) => {
      element.contentEditable = String(enabled);
      element.setAttribute("spellcheck", String(enabled));
    });
    document.getElementById("save-edits").textContent = enabled ? "Save page edits" : "Edit page text";
    editorPanel.classList.toggle("is-editing", enabled);
  }

  editorToggle.addEventListener("click", () => toggleEditor());
  document.getElementById("editor-close").addEventListener("click", () => toggleEditor(false));
  document.getElementById("save-edits").addEventListener("click", () => {
    if (!editorPanel.classList.contains("is-editing")) {
      setEditing(true);
      showToast("Click any dotted text to edit it.");
      return;
    }
    try {
      localStorage.setItem(EDITS_KEY, JSON.stringify(editableElements.map((element) => element.innerHTML)));
      setEditing(false);
      showToast("Your page edits are saved in this browser.");
    } catch (error) {
      console.error("Could not save page edits.", error);
      showToast("Couldn't save edits. Check this browser's storage settings.");
    }
  });

  document.getElementById("reset-edits").addEventListener("click", () => {
    localStorage.removeItem(EDITS_KEY);
    window.location.reload();
  });

  function getBookings() {
    try {
      const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
      return Array.isArray(bookings) ? bookings : [];
    } catch (error) {
      console.error("Could not read local booking requests.", error);
      return [];
    }
  }

  function renderBookings() {
    const bookings = getBookings();
    bookingsContainer.replaceChildren();
    if (!bookings.length) {
      const emptyState = document.createElement("p");
      emptyState.textContent = "No booking requests have been saved in this browser.";
      emptyState.className = "form-subtitle";
      bookingsContainer.append(emptyState);
      return;
    }
    bookings.forEach((booking) => {
      const entry = document.createElement("div");
      entry.className = "booking-entry";
      const name = document.createElement("strong");
      name.textContent = `${booking.name} · ${booking.topic}`;
      const details = document.createElement("span");
      details.textContent = `${booking.date} at ${booking.time} · ${booking.email}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete request";
      remove.addEventListener("click", () => {
        const remaining = getBookings().filter((item) => item.id !== booking.id);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(remaining));
        renderBookings();
      });
      entry.append(name, details, remove);
      bookingsContainer.append(entry);
    });
  }

  document.getElementById("show-bookings").addEventListener("click", () => {
    bookingsContainer.hidden = !bookingsContainer.hidden;
    if (!bookingsContainer.hidden) renderBookings();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const request = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(formData.get("name")).trim(),
      email: String(formData.get("email")).trim(),
      topic: String(formData.get("topic")),
      date: String(formData.get("date")),
      time: String(formData.get("time")),
      message: String(formData.get("message")).trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const bookings = getBookings();
      bookings.push(request);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      form.reset();
      document.getElementById("form-success").hidden = false;
      document.getElementById("form-success").scrollIntoView({ behavior: "smooth", block: "nearest" });
      showToast("Request saved on this device.");
    } catch (error) {
      console.error("Could not save booking request.", error);
      showToast("Couldn't save your request. Please try again or email directly.");
    }
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
