/* I&M Services: small, dependency-free site script. */
(function () {
  "use strict";

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var OPEN_HOUR = 8;   // 8:00 am
  var CLOSE_HOUR = 17; // 5:00 pm
  var SERVICE_LABELS = {
    "fertilization": "Fertilization",
    "weed-control": "Weed control",
    "pest-control": "Pest control",
    "perimeter-pest-control": "Perimeter pest control",
    "something-else": "Something else",
    "not-sure": "Not sure yet"
  };

  /* Business hours, read in Florida time so visitors anywhere see the right status. */
  function floridaNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "long", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date());
    var get = function (type) { return (parts.find(function (p) { return p.type === type; }) || {}).value; };
    return { day: DAYS.indexOf(get("weekday")), hour: parseInt(get("hour"), 10) % 24, minute: parseInt(get("minute"), 10) };
  }

  function hoursStatus() {
    var now = floridaNow();
    var weekday = now.day >= 1 && now.day <= 5;
    var mins = now.hour * 60 + now.minute;
    if (weekday && mins >= OPEN_HOUR * 60 && mins < CLOSE_HOUR * 60) {
      return { open: true, text: "Open now until 5pm" };
    }
    if (weekday && mins < OPEN_HOUR * 60) return { open: false, text: "Closed now, opens today at 8am" };
    var next = now.day === 5 || now.day === 6 ? "Monday" : "tomorrow";
    if (now.day === 0) next = "tomorrow";
    return { open: false, text: "Closed now, opens " + next + " at 8am" };
  }

  function applyHours() {
    var status = hoursStatus();
    document.querySelectorAll("[data-hours-status]").forEach(function (el) {
      el.classList.toggle("is-open", status.open);
      var label = el.querySelector("[data-hours-text]");
      if (label) label.textContent = status.text;
    });
    var today = DAYS[floridaNow().day];
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("is-today", row.getAttribute("data-day") === today);
    });
  }

  /* Header shadow once the page scrolls. */
  function stickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu. */
  function mobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.getElementById("mobile-nav");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      toggle.querySelector("use").setAttribute("href", open ? "#i-menu" : "#i-x");
      panel.hidden = open;
    });
  }

  /* Small helpers for validation. */
  function setError(field, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
    var out = wrap.querySelector(".field-error");
    if (out) out.textContent = message || "";
  }

  function validateField(field) {
    var value = field.value.trim();
    var name = field.name;
    if (field.required && !value) {
      setError(field, field.getAttribute("data-required-msg") || "Please fill this in.");
      return false;
    }
    if (value && name === "zip" && !/^\d{5}$/.test(value)) {
      setError(field, "Enter a 5-digit ZIP code.");
      return false;
    }
    if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(field, "That email doesn't look right.");
      return false;
    }
    if (value && field.type === "tel" && value.replace(/\D/g, "").length < 10) {
      setError(field, "Enter a 10-digit phone number.");
      return false;
    }
    setError(field, "");
    return true;
  }

  function formatPhone(input) {
    input.addEventListener("input", function () {
      var d = input.value.replace(/\D/g, "").slice(0, 10);
      var out = d;
      if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
      else if (d.length > 0) out = "(" + d;
      input.value = out;
    });
  }

  /* Hero "quote starter": collects services + ZIP and hands off to the full quote form. */
  function quoteStarter() {
    document.querySelectorAll("[data-quote-starter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var zip = form.querySelector("[name=zip]");
        if (!validateField(zip)) { zip.focus(); return; }
        var services = Array.prototype.map.call(form.querySelectorAll("[name=service]:checked"), function (c) { return c.value; });
        var params = new URLSearchParams();
        if (services.length) params.set("service", services.join(","));
        if (zip.value.trim()) params.set("zip", zip.value.trim());
        window.location.href = form.getAttribute("data-action") + (params.toString() ? "?" + params.toString() : "");
      });
    });
  }

  /* Three-step quote funnel. Front end only: submitting shows the confirmation screen. */
  function quoteFunnel() {
    var form = document.querySelector("[data-quote-funnel]");
    if (!form) return;
    var panels = Array.prototype.slice.call(form.querySelectorAll("[data-step]"));
    var bar = document.querySelector("[data-progress-bar]");
    var label = document.querySelector("[data-progress-label]");
    var back = form.querySelector("[data-back]");
    var next = form.querySelector("[data-next]");
    var submit = form.querySelector("[data-submit]");
    var current = 0;

    // Prefill from links like ?service=pest-control&zip=33065&veteran=1
    var params = new URLSearchParams(window.location.search);
    (params.get("service") || "").split(",").forEach(function (v) {
      var box = form.querySelector('[name=service][value="' + v + '"]');
      if (box) box.checked = true;
    });
    if (params.get("zip")) form.querySelector("[name=zip]").value = params.get("zip").replace(/\D/g, "").slice(0, 5);
    if (params.get("veteran") === "1") form.querySelector("[name=veteran]").checked = true;
    if (params.get("issue")) form.querySelector("[name=details]").value = params.get("issue");

    function show(i) {
      current = i;
      panels.forEach(function (p, idx) { p.hidden = idx !== i; });
      back.hidden = i === 0;
      next.hidden = i === panels.length - 1;
      submit.hidden = i !== panels.length - 1;
      bar.style.width = ((i + 1) / panels.length * 100) + "%";
      label.textContent = "Step " + (i + 1) + " of " + panels.length;
      updateSummary();
    }

    function stepValid(i) {
      var panel = panels[i];
      var ok = true;
      var err = panel.querySelector(".step-error");
      if (i === 0) {
        ok = panel.querySelectorAll("[name=service]:checked").length > 0;
        if (err) err.classList.toggle("show", !ok);
        return ok;
      }
      if (i === 1) {
        var typeChosen = panel.querySelector("[name=property]:checked");
        if (err) err.classList.toggle("show", !typeChosen);
        ok = Boolean(typeChosen);
      }
      panel.querySelectorAll(".input").forEach(function (f) { if (!validateField(f)) ok = false; });
      return ok;
    }

    function updateSummary() {
      var list = document.querySelector("[data-summary]");
      if (!list) return;
      var services = Array.prototype.map.call(form.querySelectorAll("[name=service]:checked"), function (c) { return SERVICE_LABELS[c.value]; });
      var property = form.querySelector("[name=property]:checked");
      var zip = form.querySelector("[name=zip]").value.trim();
      var vet = form.querySelector("[name=veteran]").checked;
      var rows = [
        ["Service", services.length ? services.join(", ") : "Not picked yet"],
        ["Property", property ? property.value : "Not picked yet"],
        ["ZIP code", zip || "Not added yet"],
        ["Veteran discount", vet ? "Yes, 10% off" : "No"]
      ];
      list.innerHTML = rows.map(function (r) { return "<li><span>" + r[0] + "</span><strong>" + r[1] + "</strong></li>"; }).join("");
    }

    form.addEventListener("change", updateSummary);
    form.addEventListener("input", function (e) { if (e.target.name === "zip") updateSummary(); });
    next.addEventListener("click", function () {
      if (stepValid(current)) { show(current + 1); form.scrollIntoView({ block: "start" }); }
    });
    back.addEventListener("click", function () { show(current - 1); });
    form.querySelectorAll(".input").forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value.trim()) validateField(f); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!stepValid(current)) return;
      // To go live, send new FormData(form) to your form service here, then show the confirmation.
      var name = form.querySelector("[name=name]").value.trim().split(" ")[0];
      var done = document.querySelector("[data-quote-done]");
      done.querySelector("[data-first-name]").textContent = name ? ", " + name : "";
      form.closest(".form-card").hidden = true;
      done.hidden = false;
      done.scrollIntoView({ block: "start" });
    });

    show(0);
  }

  /* Contact form. Front end only. */
  function contactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.querySelectorAll(".input").forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value.trim()) validateField(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll(".input").forEach(function (f) { if (!validateField(f)) ok = false; });
      if (!ok) { var bad = form.querySelector("[aria-invalid=true]"); if (bad) bad.focus(); return; }
      // To go live, send new FormData(form) to your form service here.
      form.hidden = true;
      document.querySelector("[data-contact-done]").hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyHours();
    setInterval(applyHours, 60000);
    stickyHeader();
    mobileNav();
    document.querySelectorAll("input[type=tel]").forEach(formatPhone);
    quoteStarter();
    quoteFunnel();
    contactForm();
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
