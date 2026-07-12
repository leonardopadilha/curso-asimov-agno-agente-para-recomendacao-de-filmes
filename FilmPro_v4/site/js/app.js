// FilmPro — integração com a API de recomendações (FastAPI + Agno)

const API_BASE = window.location.hostname && window.location.port !== "8000"
  ? "http://localhost:8000"
  : "";

const form = document.getElementById("recommend-form");
const input = document.getElementById("preferences-input");
const submitBtn = document.getElementById("submit-btn");
const submitIcon = document.getElementById("submit-icon");
const submitLabel = document.getElementById("submit-label");

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const resultsSection = document.getElementById("results-section");
const resultsCount = document.getElementById("results-count");
const resultsGrid = document.getElementById("results-grid");
const cardTemplate = document.getElementById("movie-card-template");

const apiStatusDot = document.getElementById("api-status-dot");
const apiStatusPing = document.getElementById("api-status-ping");
const apiStatusText = document.getElementById("api-status-text");

const ICON_LOADER = `
  <svg class="w-4 h-4 spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>`;
const ICON_SEARCH = `
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>`;

function hide(el) { el.classList.add("hidden"); }
function show(el) { el.classList.remove("hidden"); }

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitIcon.innerHTML = isLoading ? ICON_LOADER : ICON_SEARCH;
  submitLabel.textContent = isLoading ? "Buscando..." : "Recomendar filmes";
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function badge(text, extraClasses) {
  const span = document.createElement("span");
  span.className = `text-[11px] rounded-md px-2 py-0.5 ${extraClasses}`;
  span.textContent = text;
  return span;
}

function renderMovieCard(movie) {
  const node = cardTemplate.content.cloneNode(true);

  const posterImg = node.querySelector(".poster-img");
  const posterFallback = node.querySelector(".poster-fallback");
  if (movie.poster_url) {
    posterImg.src = movie.poster_url;
    posterImg.alt = movie.title;
    posterImg.classList.remove("hidden");
    posterImg.addEventListener("error", () => {
      posterImg.classList.add("hidden");
      posterFallback.classList.remove("hidden");
    });
    posterFallback.classList.add("hidden");
  }

  node.querySelector(".rating").textContent = movie.imdb_rating != null ? movie.imdb_rating.toFixed(1) : "–";
  node.querySelector(".title").textContent = movie.title;
  node.querySelector(".year").textContent = movie.release_year || "";
  node.querySelector(".director").textContent = movie.director ? `Dirigido por ${movie.director}` : "";
  node.querySelector(".synopsis").textContent = movie.synopsis || "";
  node.querySelector(".reason-text").textContent = movie.recommendation_reason || "";

  const genresWrap = node.querySelector(".genres");
  (movie.genres || []).forEach((genre) => {
    genresWrap.appendChild(badge(genre, "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 uppercase"));
  });

  const duration = formatDuration(movie.duration_minutes);
  if (duration) node.querySelector(".duration").textContent = `⏱ ${duration}`;
  if (movie.primary_language) node.querySelector(".language").textContent = `🌐 ${movie.primary_language}`;
  if (movie.age_rating) node.querySelector(".age-rating").textContent = `🔞 ${movie.age_rating}`;

  const castWrap = node.querySelector(".cast-wrap");
  const cast = movie.cast || [];
  if (cast.length) {
    node.querySelector(".cast").textContent = cast
      .map((c) => (c.character ? `${c.name} (${c.character})` : c.name))
      .join(", ");
  } else {
    castWrap.classList.add("hidden");
  }

  const warnings = movie.content_warnings || [];
  if (warnings.length) {
    const warningsWrap = node.querySelector(".warnings-wrap");
    warningsWrap.classList.remove("hidden");
    const warningsEl = node.querySelector(".warnings");
    warnings.forEach((w) => warningsEl.appendChild(badge(w, "bg-white/5 text-neutral-300 ring-1 ring-white/10")));
  }

  const platforms = movie.streaming_platforms || [];
  if (platforms.length) {
    const platformsWrap = node.querySelector(".platforms-wrap");
    platformsWrap.classList.remove("hidden");
    const platformsEl = node.querySelector(".platforms");
    platforms.forEach((p) => platformsEl.appendChild(badge(p, "bg-white/5 text-neutral-300 ring-1 ring-white/10")));
  }

  return node;
}

function renderResults(data) {
  resultsGrid.innerHTML = "";
  const movies = data.movies || [];
  resultsCount.textContent = `${data.total_recommendations ?? movies.length} filme(s) encontrado(s)`;

  movies.forEach((movie, index) => {
    const card = renderMovieCard(movie);
    const article = card.querySelector("article");
    article.style.animationDelay = `${Math.min(index, 6) * 60}ms`;
    resultsGrid.appendChild(card);
  });

  show(resultsSection);
}

async function requestRecommendations(preferences) {
  const response = await fetch(`${API_BASE}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : `Erro HTTP ${response.status}`;
    throw new Error(detail);
  }

  if (!payload || !payload.success) {
    throw new Error((payload && payload.message) || "Resposta inválida da API.");
  }

  return payload.data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const preferences = input.value.trim();
  if (preferences.length < 10) {
    input.focus();
    return;
  }

  hide(errorState);
  hide(resultsSection);
  show(loadingState);
  setLoading(true);

  try {
    const data = await requestRecommendations(preferences);
    hide(loadingState);
    renderResults(data);
  } catch (err) {
    hide(loadingState);
    errorMessage.textContent = err.message || "Tente novamente em instantes.";
    show(errorState);
  } finally {
    setLoading(false);
  }
});

// ============ STATUS DA API (health check) ============

const HEALTH_CHECK_INTERVAL_MS = 20000;
const HEALTH_CHECK_TIMEOUT_MS = 4000;

const API_STATUS_STYLES = {
  checking: { color: "bg-neutral-500", pulse: false, text: "Verificando API...", textColor: "text-neutral-400" },
  online: { color: "bg-green-500", pulse: true, text: "Agente de IA", textColor: "text-neutral-300" },
  offline: { color: "bg-red-500", pulse: false, text: "API Offline", textColor: "text-red-400" },
};

function setApiStatus(status) {
  const s = API_STATUS_STYLES[status];
  apiStatusDot.className = `relative inline-flex rounded-full h-1.5 w-1.5 ${s.color}`;
  apiStatusPing.className = s.pulse
    ? `animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.color}`
    : `absolute inline-flex h-full w-full rounded-full opacity-0 ${s.color}`;
  apiStatusText.textContent = s.text;
  apiStatusText.className = s.textColor;
}

async function checkApiHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/health`, { method: "GET", signal: controller.signal });
    setApiStatus(response.ok ? "online" : "offline");
  } catch (err) {
    setApiStatus("offline");
  } finally {
    clearTimeout(timeoutId);
  }
}

checkApiHealth();
setInterval(checkApiHealth, HEALTH_CHECK_INTERVAL_MS);
