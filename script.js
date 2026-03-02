// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== Year =====
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Mobile Nav =====
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

function closeMenu() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".nav__link", navMenu).forEach(a => a.addEventListener("click", closeMenu));

  document.addEventListener("click", (e) => {
    const inside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!inside) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// ===== Smooth scroll (sticky offset) =====
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const header = document.querySelector(".header");
    const headerHeight = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

// ===== Scroll progress =====
const progressBar = $("#progressBar");
function updateProgress() {
  if (!progressBar) return;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight =
    (document.documentElement.scrollHeight || document.body.scrollHeight) -
    document.documentElement.clientHeight;
  const p = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${p.toFixed(2)}%`;
}
window.addEventListener("scroll", updateProgress);
window.addEventListener("resize", updateProgress);
updateProgress();

// ===== Theme Toggle (persist) =====
const themeToggle = $("#themeToggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    const icon = themeToggle.querySelector(".icon");
    if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
  }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") {
  setTheme(savedTheme);
} else {
  setTheme("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// ===== Premium Typing (type + delete + pauses) =====
const typingEl = $("#typingText");
const roles = ["Web Developer", "UI Designer", "Freelancer"];
let roleIdx = 0;
let charIdx = 0;
let deleting = false;

function tick() {
  if (!typingEl) return;

  const current = roles[roleIdx];
  const speed = deleting ? 45 : 70;

  if (!deleting) {
    charIdx++;
    typingEl.textContent = current.slice(0, charIdx);
    if (charIdx >= current.length) {
      deleting = true;
      return setTimeout(tick, 900);
    }
  } else {
    charIdx--;
    typingEl.textContent = current.slice(0, Math.max(0, charIdx));
    if (charIdx <= 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      return setTimeout(tick, 250);
    }
  }

  setTimeout(tick, speed);
}
tick();

// ===== Reveal (IntersectionObserver + stagger) =====
const revealEls = $$(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add("is-visible"));
}

// ===== Skills bars animate when skills section enters =====
const skillsWrap = $("#skillsWrap");
if (skillsWrap && "IntersectionObserver" in window) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$(".bar__fill", skillsWrap).forEach((bar, i) => {
          const w = bar.getAttribute("data-width") || "0%";
          bar.style.transitionDelay = `${i * 120}ms`;
          bar.style.width = w;
        });
        skillObserver.unobserve(skillsWrap);
      }
    });
  }, { threshold: 0.2 });
  skillObserver.observe(skillsWrap);
} else if (skillsWrap) {
  $$(".bar__fill", skillsWrap).forEach(bar => {
    bar.style.width = bar.getAttribute("data-width") || "0%";
  });
}

// ===== Projects Data =====
const PROJECTS = [
  {
    id: "business",
    title: "NovaWorks — Business Landing Page",
    desc: "A client-ready business landing page with smooth scrolling, scroll reveal, and contact form validation. Built for fast freelance delivery.",
    tags: ["landing", "ui", "responsive"],
    live: "https://fredeeex.github.io/business-landing-page/",
    repo: "https://github.com/fredeeex/business-landing-page"
  },
  {
    id: "restaurant",
    title: "Saffron & Stone — Restaurant Template",
    desc: "Premium restaurant template featuring menu tabs, gallery lightbox, reviews slider, and reservation form validation — all in vanilla JS.",
    tags: ["template", "ui", "vanilla-js"],
    live: "https://fredeeex.github.io/restaurant-template/",
    repo: "https://github.com/fredeeex/restaurant-template"
  },
  {
    id: "portfolio",
    title: "Portfolio Advanced — Glass + Modal UI",
    desc: "A premium portfolio template: glassmorphism UI, dark/light theme toggle, stronger animations, project modal popup and live demo buttons.",
    tags: ["template", "ui", "landing"],
    live: "#top",
    repo: "#"
  },
];

// ===== Render Projects =====
const grid = $("#projectGrid");

function tagEl(t) {
  return `<span class="tag">${t}</span>`;
}

function cardThumbTint(tags) {
  // simple tint by tag for visual variation
  if (tags.includes("landing")) return `linear-gradient(135deg, rgba(124,58,237,.25), rgba(56,189,248,.14))`;
  if (tags.includes("template")) return `linear-gradient(135deg, rgba(34,197,94,.18), rgba(56,189,248,.14))`;
  return `linear-gradient(135deg, rgba(56,189,248,.18), rgba(124,58,237,.16))`;
}

function renderProjects(filter = "all") {
  if (!grid) return;

  const items = PROJECTS.filter(p => filter === "all" ? true : p.tags.includes(filter));
  grid.innerHTML = items.map(p => `
    <article class="card" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${p.title}">
      <div class="card__thumb" style="background:${cardThumbTint(p.tags)}"></div>
      <div class="card__body">
        <h3 class="card__title">${p.title}</h3>
        <p class="card__desc">${p.desc}</p>

        <div class="card__tags">
          ${p.tags.map(tagEl).join("")}
        </div>

        <div class="card__actions">
          <a class="mini-btn" href="${p.live}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">Live</a>
          <a class="mini-btn" href="${p.repo}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">Repo</a>
          <button class="mini-btn" type="button" data-open="${p.id}" onclick="event.stopPropagation()">Details</button>
        </div>
      </div>
    </article>
  `).join("");

  // bind card open
  $$(".card", grid).forEach(card => {
    const id = card.getAttribute("data-id");
    card.addEventListener("click", () => openModal(id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(id);
      }
    });
  });

  // bind details buttons
  $$('[data-open]', grid).forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open")));
  });
}

renderProjects("all");

// ===== Filters =====
const filters = $$(".filter");
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    renderProjects(btn.getAttribute("data-filter"));
  });
});

// ===== Modal =====
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalTitle = $("#modalTitle");
const modalDesc = $("#modalDesc");
const modalTags = $("#modalTags");
const modalLive = $("#modalLive");
const modalRepo = $("#modalRepo");

function openModal(id) {
  if (!modal) return;
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  if (modalTitle) modalTitle.textContent = p.title;
  if (modalDesc) modalDesc.textContent = p.desc;
  if (modalTags) modalTags.innerHTML = p.tags.map(tagEl).join("");

  if (modalLive) modalLive.href = p.live || "#";
  if (modalRepo) modalRepo.href = p.repo || "#";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (modalClose) modalClose.addEventListener("click", closeModal);
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}