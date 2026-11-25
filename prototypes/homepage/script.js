(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initNavbar();
  initReveal();
  initChaos();
  initAiTags();
  initBillingToggle();
  initYear();

  // Navbar gets more opaque once the page scrolls.
  function initNavbar() {
    const nav = document.getElementById("nav");
    if (!nav) return;

    const update = () => nav.classList.toggle("scrolled", window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // Fade elements in as they scroll into view.
  function initReveal() {
    const elements = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => observer.observe(el));
  }

  // Floating icons that drift, bounce off walls, pulse, and repel from the cursor.
  function initChaos() {
    const container = document.getElementById("chaos");
    if (!container) return;

    const REPEL_RADIUS = 110;
    const REPEL_FORCE = 0.6;
    const MAX_SPEED = 3.2;
    const BASE_SPEED = 0.6;
    const FRICTION = 0.985;

    const mouse = { x: 0, y: 0, active: false };
    let bounds = container.getBoundingClientRect();

    const icons = Array.from(container.querySelectorAll(".chaos-icon")).map((el, i) => {
      const size = el.offsetWidth;
      const angle = Math.random() * Math.PI * 2;
      return {
        el,
        size,
        x: Math.random() * Math.max(bounds.width - size, 1),
        y: Math.random() * Math.max(bounds.height - size, 1),
        vx: Math.cos(angle) * BASE_SPEED,
        vy: Math.sin(angle) * BASE_SPEED,
        rotation: Math.random() * 30 - 15,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        phase: i * 0.8,
      };
    });

    container.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    });
    container.addEventListener("mouseleave", () => {
      mouse.active = false;
    });
    window.addEventListener("resize", () => {
      bounds = container.getBoundingClientRect();
    });

    if (prefersReducedMotion) {
      icons.forEach(render);
      return;
    }

    function render(icon, time = 0) {
      const scale = 1 + Math.sin(time / 900 + icon.phase) * 0.08;
      icon.el.style.transform = `translate(${icon.x}px, ${icon.y}px) rotate(${icon.rotation}deg) scale(${scale})`;
    }

    function step(icon) {
      if (mouse.active) {
        const dx = icon.x + icon.size / 2 - mouse.x;
        const dy = icon.y + icon.size / 2 - mouse.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < REPEL_RADIUS) {
          const force = (1 - distance / REPEL_RADIUS) * REPEL_FORCE;
          icon.vx += (dx / distance) * force;
          icon.vy += (dy / distance) * force;
        }
      }

      const speed = Math.hypot(icon.vx, icon.vy);
      if (speed > MAX_SPEED) {
        icon.vx = (icon.vx / speed) * MAX_SPEED;
        icon.vy = (icon.vy / speed) * MAX_SPEED;
      } else if (speed > BASE_SPEED) {
        icon.vx *= FRICTION;
        icon.vy *= FRICTION;
      }

      icon.x += icon.vx;
      icon.y += icon.vy;

      const maxX = bounds.width - icon.size;
      const maxY = bounds.height - icon.size;
      if (icon.x <= 0 || icon.x >= maxX) {
        icon.vx *= -1;
        icon.x = Math.min(Math.max(icon.x, 0), maxX);
      }
      if (icon.y <= 0 || icon.y >= maxY) {
        icon.vy *= -1;
        icon.y = Math.min(Math.max(icon.y, 0), maxY);
      }

      icon.rotation += icon.rotationSpeed;
      if (Math.abs(icon.rotation) > 18) icon.rotationSpeed *= -1;
    }

    function frame(time) {
      icons.forEach((icon) => {
        step(icon);
        render(icon, time);
      });
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  // Tags pop in one by one when the editor mockup scrolls into view.
  function initAiTags() {
    const list = document.getElementById("ai-tags");
    if (!list) return;

    const tags = list.querySelectorAll(".tag");
    const show = () => {
      tags.forEach((tag, i) => {
        setTimeout(() => tag.classList.add("shown"), prefersReducedMotion ? 0 : 400 + i * 180);
      });
    };

    if (!("IntersectionObserver" in window)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        show();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(list);
  }

  // Monthly / yearly pricing toggle for the Pro plan.
  function initBillingToggle() {
    const options = document.querySelectorAll(".toggle-option");
    const amount = document.getElementById("pro-amount");
    const period = document.getElementById("pro-period");
    const note = document.getElementById("pro-note");
    if (!amount || !period || !note) return;

    const plans = {
      monthly: { amount: "$8", period: "/month", note: "Billed monthly. Cancel anytime." },
      yearly: { amount: "$72", period: "/year", note: "Just $6/month, billed yearly." },
    };

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const plan = plans[option.dataset.billing];
        if (!plan) return;

        options.forEach((o) => {
          const active = o === option;
          o.classList.toggle("active", active);
          o.setAttribute("aria-pressed", String(active));
        });

        amount.textContent = plan.amount;
        period.textContent = plan.period;
        note.textContent = plan.note;
      });
    });
  }

  function initYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }
})();
