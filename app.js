const STORAGE_KEYS = {
  rooms: "rentHomeRooms",
  users: "rentHomeUsers",
  currentUser: "rentHomeCurrentUser",
  favorites: "rentHomeFavorites"
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80";

const sampleRooms = [
  {
    id: "room-1",
    title: "Room in Delhi",
    price: 5000,
    location: "Delhi",
    description: "Nice room with natural light, nearby metro access, and a peaceful neighborhood.",
    image: DEFAULT_IMAGE,
    contact: "9876543210",
    rating: 4.6
  },
  {
    id: "room-2",
    title: "Cozy Space in Mumbai",
    price: 7200,
    location: "Mumbai",
    description: "Comfortable room close to shops and transport with a bright and clean setup.",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    contact: "9123456780",
    rating: 4.4
  },
  {
    id: "room-3",
    title: "Affordable Room in Jaipur",
    price: 4300,
    location: "Jaipur",
    description: "Budget-friendly room with ventilation, a study corner, and easy market access.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    contact: "9988776655",
    rating: 4.8
  }
];

document.addEventListener("DOMContentLoaded", () => {
  seedRooms();
  updateAuthNav();

  const page = document.body.dataset.page;

  if (page === "home") initHomePage();
  if (page === "auth") initAuthPage();
  if (page === "post-room") initPostRoomPage();
  if (page === "listings") initListingsPage();
  if (page === "room-detail") initRoomDetailPage();
});

function seedRooms() {
  const existingRooms = getRooms();
  if (!existingRooms.length) {
    localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(sampleRooms));
  }
}

function getRooms() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.rooms) || "[]");
}

function saveRooms(rooms) {
  localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || "null");
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
}

function updateAuthNav() {
  const authLink = document.getElementById("authLink");
  const user = getCurrentUser();

  if (authLink && user) {
    authLink.textContent = user.name;
    authLink.href = "auth.html";
  }
}

function initHomePage() {
  const rooms = getRooms();
  const homeRoomGrid = document.getElementById("homeRoomGrid");
  renderRooms(homeRoomGrid, rooms.slice(0, 3));

  const featured = rooms[0];
  if (featured) {
    document.getElementById("featuredRoomImage").src = featured.image || DEFAULT_IMAGE;
    document.getElementById("featuredRoomTitle").textContent = featured.title;
    document.getElementById("featuredRoomMeta").textContent = `${featured.location} - Rs ${featured.price}/month`;
  }

  const homeSearchForm = document.getElementById("homeSearchForm");
  homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.getElementById("homeSearchInput").value.trim();
    const url = query ? `listings.html?location=${encodeURIComponent(query)}` : "listings.html";
    window.location.href = url;
  });
}

function initAuthPage() {
  const authMessage = document.getElementById("authMessage");
  const tabs = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".form-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      forms.forEach((form) => form.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tabTarget).classList.add("active");
      setStatus(authMessage, "");
    });
  });

  document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value.trim();

    const users = getUsers();
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      setStatus(authMessage, "This email is already registered. Please log in instead.", "error");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ name, email });
    setStatus(authMessage, "Signup successful. You are now logged in.", "success");
    event.target.reset();
    updateAuthNav();
  });

  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const user = getUsers().find((item) => item.email === email && item.password === password);
    if (!user) {
      setStatus(authMessage, "Invalid email or password. Please try again.", "error");
      return;
    }

    setCurrentUser({ name: user.name, email: user.email });
    setStatus(authMessage, `Welcome back, ${user.name}.`, "success");
    event.target.reset();
    updateAuthNav();
  });
}

function initPostRoomPage() {
  const postRoomForm = document.getElementById("postRoomForm");
  const messageBox = document.getElementById("postRoomMessage");

  postRoomForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("roomTitle").value.trim();
    const price = Number(document.getElementById("roomPrice").value);
    const location = document.getElementById("roomLocation").value.trim();
    const description = document.getElementById("roomDescription").value.trim();
    const contact = document.getElementById("roomContact").value.trim();
    const imageFile = document.getElementById("roomImage").files[0];

    const image = imageFile ? await fileToDataUrl(imageFile) : DEFAULT_IMAGE;

    const newRoom = {
      id: `room-${Date.now()}`,
      title,
      price,
      location,
      description,
      image,
      contact,
      rating: generateRating()
    };

    const rooms = getRooms();
    rooms.unshift(newRoom);
    saveRooms(rooms);

    postRoomForm.reset();
    setStatus(messageBox, "Room posted successfully. It now appears in the listings.", "success");
  });
}

function initListingsPage() {
  const listingRoomGrid = document.getElementById("listingRoomGrid");
  const searchInput = document.getElementById("listingSearchInput");
  const params = new URLSearchParams(window.location.search);
  const presetLocation = params.get("location") || "";
  searchInput.value = presetLocation;

  const refreshListings = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filteredRooms = getRooms().filter((room) =>
      room.location.toLowerCase().includes(query)
    );
    renderRooms(listingRoomGrid, filteredRooms, query);
  };

  document.getElementById("listingSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    refreshListings();
  });

  searchInput.addEventListener("input", refreshListings);
  refreshListings();
}

function initRoomDetailPage() {
  const roomDetailContainer = document.getElementById("roomDetailContainer");
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("id");
  const room = getRooms().find((item) => item.id === roomId);

  if (!room) {
    roomDetailContainer.innerHTML = `
      <div class="empty-state">
        <h2>Room not found</h2>
        <p>The listing may have been removed or the link is incorrect.</p>
        <a class="btn btn-primary" href="listings.html">Back to listings</a>
      </div>
    `;
    return;
  }

  const favorites = getFavorites();
  const isFavorite = favorites.includes(room.id);
  const whatsappLink = `https://wa.me/${room.contact}?text=${encodeURIComponent(`Hi, I am interested in ${room.title} on Rent Home.`)}`;

  roomDetailContainer.innerHTML = `
    <div class="detail-shell">
      <img class="detail-image" src="${room.image || DEFAULT_IMAGE}" alt="${escapeHtml(room.title)}">
      <div class="detail-copy">
        <span class="eyebrow">Room details</span>
        <h1>${escapeHtml(room.title)}</h1>
        <div class="detail-meta">
          <span class="meta-pill">Rs ${room.price}/month</span>
          <span class="meta-pill">${escapeHtml(room.location)}</span>
          <span class="rating-pill">&starf; ${room.rating || 4.5}</span>
        </div>
        <p class="room-description">${escapeHtml(room.description)}</p>
        <p class="room-meta"><strong>Contact:</strong> ${escapeHtml(room.contact)}</p>
        <div class="detail-actions">
          <a class="btn btn-primary" href="tel:${room.contact}">Call Owner</a>
          <a class="btn btn-secondary" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <button class="icon-btn ${isFavorite ? "active" : ""}" id="detailFavoriteBtn" type="button" aria-label="Favorite room">&#10084;</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detailFavoriteBtn").addEventListener("click", () => {
    toggleFavorite(room.id);
    initRoomDetailPage();
  });
}

function renderRooms(container, rooms, query = "") {
  if (!rooms.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No rooms found</h3>
        <p>${query ? `No rooms matched "${escapeHtml(query)}". Try another location.` : "No rooms available yet. Post one to get started."}</p>
      </div>
    `;
    return;
  }

  const favorites = getFavorites();
  container.innerHTML = rooms
    .map((room) => {
      const isFavorite = favorites.includes(room.id);
      return `
        <article class="room-card">
          <img src="${room.image || DEFAULT_IMAGE}" alt="${escapeHtml(room.title)}">
          <div class="room-card-body">
            <h3>${escapeHtml(room.title)}</h3>
            <p class="room-meta">${escapeHtml(room.location)}</p>
            <div class="price-row">
              <span class="price">Rs ${room.price}</span>
              <span class="rating-pill">&starf; ${room.rating || 4.5}</span>
            </div>
            <div class="room-card-actions">
              <a class="btn btn-primary full-width" href="room.html?id=${room.id}">View Details</a>
              <button class="icon-btn ${isFavorite ? "active" : ""}" type="button" data-favorite-id="${room.id}" aria-label="Favorite room">&#10084;</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleFavorite(button.dataset.favoriteId);
      const currentRooms = container.id === "homeRoomGrid" ? getRooms().slice(0, 3) : filterCurrentListingRooms();
      renderRooms(container, currentRooms, query);
    });
  });
}

function filterCurrentListingRooms() {
  const searchInput = document.getElementById("listingSearchInput");
  if (!searchInput) return getRooms();
  const query = searchInput.value.trim().toLowerCase();
  return getRooms().filter((room) => room.location.toLowerCase().includes(query));
}

function toggleFavorite(roomId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(roomId);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(roomId);
  }

  saveFavorites(favorites);
}

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = "status-message";
  if (type) element.classList.add(type);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}

function generateRating() {
  return (4 + Math.random()).toFixed(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
