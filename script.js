// Rotates one word in the hero tagline through a short list of topics.
// Edit the TOPICS array below to change what shows up.
const TOPICS = [
  "politics",
  "geopolitics",
  "pop culture",
  "food",
  "sports",
  "history",
  "tech and science",
  "video games"
];

const rotatorEl = document.getElementById("rotator");
let topicIndex = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (rotatorEl && !reduceMotion) {
  setInterval(() => {
    topicIndex = (topicIndex + 1) % TOPICS.length;
    rotatorEl.textContent = TOPICS[topicIndex];
  }, 2200);
}

// ----- Project cards: click or keyboard to flip -----
const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {
  const flip = () => {
    const flipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
  };

  card.addEventListener("click", flip);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  });
});

// ----- Project stats: count up when scrolled into view -----
const statEls = document.querySelectorAll(".project-stat");

const animateStat = (el) => {
  const target = parseFloat(el.dataset.value);
  const suffix = el.dataset.suffix || "";
  if (reduceMotion || Number.isNaN(target)) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.round(target * progress);
    el.textContent = `${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => observer.observe(el));
} else {
  statEls.forEach(animateStat);
}

// ----- Skills radar chart -----
// Edit these values (0-100) to update the chart. Labels here should roughly
// match the legend list in index.html.
const RADAR_DATA = [
  { label: "Analysis & SQL", value: 90 },
  { label: "Visualization", value: 88 },
  { label: "Cloud & data", value: 65 },
  { label: "GenAI & automation", value: 78 },
  { label: "Agile & delivery", value: 85 },
  { label: "Stakeholder comms", value: 92 },
];

function initSkillsRadar() {
  const svg = document.getElementById("skillsRadar");
  if (!svg) return;

  const ns = "http://www.w3.org/2000/svg";
  const size = 320;
  const center = size / 2;
  const maxR = 112;
  const ringCount = 4;
  const n = RADAR_DATA.length;

  const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointAt = (i, r) => {
    const a = angleFor(i);
    return [center + r * Math.cos(a), center + r * Math.sin(a)];
  };

  // Grid rings
  for (let ring = 1; ring <= ringCount; ring++) {
    const r = (maxR * ring) / ringCount;
    const pts = RADAR_DATA.map((_, i) => pointAt(i, r).join(",")).join(" ");
    const poly = document.createElementNS(ns, "polygon");
    poly.setAttribute("points", pts);
    poly.setAttribute("class", "radar-grid");
    svg.appendChild(poly);
  }

  // Axis lines and labels
  RADAR_DATA.forEach((d, i) => {
    const [x, y] = pointAt(i, maxR);
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    line.setAttribute("class", "radar-axis");
    svg.appendChild(line);

    const [lx, ly] = pointAt(i, maxR + 24);
    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", lx);
    text.setAttribute("y", ly);
    text.setAttribute("class", "radar-label");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = d.label;
    svg.appendChild(text);
  });

  // Animated shape + dots, starting collapsed at the center
  const shape = document.createElementNS(ns, "polygon");
  shape.setAttribute("class", "radar-shape");
  shape.setAttribute("points", RADAR_DATA.map(() => `${center},${center}`).join(" "));
  svg.appendChild(shape);

  const dots = RADAR_DATA.map(() => {
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("r", 3.5);
    dot.setAttribute("class", "radar-dot");
    dot.setAttribute("cx", center);
    dot.setAttribute("cy", center);
    svg.appendChild(dot);
    return dot;
  });

  const setShapeAt = (fraction) => {
    const pts = RADAR_DATA.map((d, i) => pointAt(i, (maxR * d.value * fraction) / 100));
    shape.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    pts.forEach(([x, y], i) => {
      dots[i].setAttribute("cx", x);
      dots[i].setAttribute("cy", y);
    });
  };

  const animate = () => {
    if (reduceMotion) {
      setShapeAt(1);
      return;
    }
    const duration = 1000;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShapeAt(eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(svg);
  } else {
    animate();
  }
}

initSkillsRadar();

// ----- Project filters -----
const filterChips = document.querySelectorAll(".filter-chip");
const projectGrid = document.getElementById("projectGrid");

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");

    const filter = chip.dataset.filter;
    projectGrid.querySelectorAll(".project-card").forEach((card) => {
      const tools = card.dataset.tools || "";
      const show = filter === "all" || tools.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  });
});
