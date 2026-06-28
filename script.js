const STORAGE_KEY = "hidden-nav-links";
const ADMIN_PASSWORD = "admin123";

const defaultLinks = [
  { name: "Google", url: "https://www.google.com", category: "搜索" },
  { name: "YouTube", url: "https://www.youtube.com", category: "视频" },
  { name: "GitHub", url: "https://github.com", category: "开发" },
  { name: "MDN", url: "https://developer.mozilla.org", category: "文档" },
  { name: "ChatGPT", url: "https://chatgpt.com", category: "AI" },
  { name: "Google Play Console", url: "https://play.google.com/console", category: "上架" },
];

const state = {
  isAdmin: false,
  links: loadLinks(),
};

const isAdminRoute = getIsAdminRoute();
const linkGrid = document.querySelector("#linkGrid");
const modalBackdrop = document.querySelector("#modalBackdrop");
const loginForm = document.querySelector("#loginForm");
const linkForm = document.querySelector("#linkForm");
const passwordInput = document.querySelector("#passwordInput");
const addLinkButton = document.querySelector("#addLinkButton");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");

document.querySelector("#closeModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});

addLinkButton.addEventListener("click", () => openModal("link"));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value !== ADMIN_PASSWORD) {
    passwordInput.value = "";
    passwordInput.placeholder = "密码错误，请重试";
    passwordInput.focus();
    return;
  }

  state.isAdmin = true;
  document.body.classList.add("is-admin");
  closeModal();
  renderLinks();
});

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#linkName").value.trim();
  const url = normalizeUrl(document.querySelector("#linkUrl").value.trim());
  const category = document.querySelector("#linkCategory").value.trim() || "自定义";

  if (!name || !url) return;

  state.links.unshift({ name, url, category });
  saveLinks();
  linkForm.reset();
  closeModal();
  renderLinks();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;

  const target = looksLikeUrl(value)
    ? normalizeUrl(value)
    : `https://www.google.com/search?q=${encodeURIComponent(value)}`;

  window.open(target, "_blank", "noopener");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

function renderLinks() {
  linkGrid.innerHTML = "";

  state.links.forEach((link, index) => {
    const card = document.createElement("a");
    card.className = "link-card";
    card.href = link.url;
    card.target = "_blank";
    card.rel = "noopener";

    card.innerHTML = `
      <strong>${escapeHtml(link.name)}</strong>
      <span>${escapeHtml(link.url)}</span>
      <em class="category">${escapeHtml(link.category)}</em>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-link";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `删除 ${link.name}`);
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    card.append(deleteButton);
    linkGrid.append(card);
  });
}

function openModal(view) {
  modalBackdrop.hidden = false;
  loginForm.hidden = view !== "login";
  linkForm.hidden = view !== "link";

  const focusTarget = view === "login" ? passwordInput : document.querySelector("#linkName");
  setTimeout(() => focusTarget.focus(), 0);
}

function closeModal() {
  modalBackdrop.hidden = true;
  passwordInput.value = "";
}

function loadLinks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : defaultLinks;
  } catch {
    return defaultLinks;
  }
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.links));
}

function normalizeUrl(value) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function looksLikeUrl(value) {
  return /^https?:\/\//i.test(value) || value.includes(".") || value.startsWith("localhost");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function getIsAdminRoute() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path.endsWith("/sun") || path.endsWith("/sun/index.html");
}

renderLinks();

if (isAdminRoute) {
  openModal("login");
}
