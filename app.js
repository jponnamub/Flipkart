const products = [
  {
    id: 1,
    name: "PixelMax 5G Pro",
    brand: "PixelMax",
    category: "Mobiles",
    price: 32999,
    mrp: 44999,
    rating: 4.5,
    reviews: 18542,
    assured: true,
    emi: true,
    exchange: true,
    delivery: "Tomorrow",
    art: "5G",
    colors: ["#2874f0", "#0f172a"],
    features: ["8 GB RAM | 256 GB storage", "50 MP OIS camera", "5000 mAh battery"],
    offers: ["10% instant bank discount", "Extra Rs. 3,000 off on exchange", "No-cost EMI from Rs. 2,750/month"],
    seller: "RetailNet"
  },
  {
    id: 2,
    name: "GalaxyWave Ultra",
    brand: "GalaxyWave",
    category: "Mobiles",
    price: 74999,
    mrp: 94999,
    rating: 4.7,
    reviews: 28560,
    assured: true,
    emi: true,
    exchange: true,
    delivery: "Tomorrow",
    art: "UL",
    colors: ["#6366f1", "#a855f7"],
    features: ["12 GB RAM | 512 GB storage", "Dynamic AMOLED display", "IP68 water resistance"],
    offers: ["Free wireless charger", "Exchange bonus up to Rs. 8,000", "No-cost EMI available"],
    seller: "SuperComNet"
  },
  {
    id: 3,
    name: "AeroBook Air 14",
    brand: "AeroBook",
    category: "Electronics",
    price: 58990,
    mrp: 79990,
    rating: 4.4,
    reviews: 9130,
    assured: true,
    emi: true,
    exchange: true,
    delivery: "2 days",
    art: "14",
    colors: ["#0284c7", "#38bdf8"],
    features: ["Intel i5 processor", "16 GB RAM | 512 GB SSD", "1.25 kg thin and light design"],
    offers: ["Student offer included", "No-cost EMI from Rs. 4,916/month", "Partner antivirus at Rs. 99"],
    seller: "TechHub"
  },
  {
    id: 4,
    name: "SoundPods Active ANC",
    brand: "SoundPods",
    category: "Electronics",
    price: 2499,
    mrp: 6999,
    rating: 4.2,
    reviews: 66110,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Today",
    art: "ANC",
    colors: ["#0f766e", "#14b8a6"],
    features: ["40 hours playback", "Active noise cancellation", "Low latency gaming mode"],
    offers: ["Buy 2 get extra 5% off", "Prepaid offer Rs. 100 off", "Free delivery"],
    seller: "AudioZone"
  },
  {
    id: 5,
    name: "MetroFit Casual Sneakers",
    brand: "MetroFit",
    category: "Fashion",
    price: 1499,
    mrp: 3999,
    rating: 4.1,
    reviews: 22105,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Tomorrow",
    art: "SN",
    colors: ["#ef4444", "#f97316"],
    features: ["Memory foam insole", "Slip-resistant sole", "7-day replacement"],
    offers: ["Extra 10% on 2 fashion items", "Bank cashback Rs. 75", "Free delivery"],
    seller: "FashionKart"
  },
  {
    id: 6,
    name: "UrbanWeave Cotton Kurta",
    brand: "UrbanWeave",
    category: "Fashion",
    price: 899,
    mrp: 2499,
    rating: 4,
    reviews: 17248,
    assured: false,
    emi: false,
    exchange: false,
    delivery: "3 days",
    art: "UW",
    colors: ["#db2777", "#f9a8d4"],
    features: ["Pure cotton fabric", "Regular fit", "30-day easy returns"],
    offers: ["Combo offer available", "SuperCoin price Rs. 849", "10% wallet cashback"],
    seller: "StyleBay"
  },
  {
    id: 7,
    name: "HomeEase 3-Seater Sofa",
    brand: "HomeEase",
    category: "Home",
    price: 21999,
    mrp: 42999,
    rating: 4.3,
    reviews: 4281,
    assured: true,
    emi: true,
    exchange: false,
    delivery: "5 days",
    art: "SO",
    colors: ["#7c2d12", "#f59e0b"],
    features: ["Solid wood frame", "Premium fabric upholstery", "Installation included"],
    offers: ["No-cost EMI from Rs. 1,833/month", "Free installation", "Extra Rs. 1,500 bank off"],
    seller: "FurnitureWorld"
  },
  {
    id: 8,
    name: "DreamRest Orthopedic Mattress",
    brand: "DreamRest",
    category: "Home",
    price: 8499,
    mrp: 19999,
    rating: 4.4,
    reviews: 13280,
    assured: true,
    emi: true,
    exchange: false,
    delivery: "4 days",
    art: "DR",
    colors: ["#16a34a", "#86efac"],
    features: ["Memory foam comfort", "10-year warranty", "Vacuum packed delivery"],
    offers: ["Extra 8% mattress discount", "No-cost EMI available", "Free pillow combo"],
    seller: "SleepStore"
  },
  {
    id: 9,
    name: "CoolMist 1.5 Ton Inverter AC",
    brand: "CoolMist",
    category: "Appliances",
    price: 35990,
    mrp: 55990,
    rating: 4.2,
    reviews: 8560,
    assured: true,
    emi: true,
    exchange: true,
    delivery: "2 days",
    art: "AC",
    colors: ["#0ea5e9", "#e0f2fe"],
    features: ["5-star energy rating", "Copper condenser", "Installation at delivery"],
    offers: ["Exchange old AC and save", "Free standard installation", "No-cost EMI from Rs. 2,999/month"],
    seller: "OmniTechRetail"
  },
  {
    id: 10,
    name: "WashPro Front Load Washer",
    brand: "WashPro",
    category: "Appliances",
    price: 28990,
    mrp: 42990,
    rating: 4.3,
    reviews: 6742,
    assured: true,
    emi: true,
    exchange: true,
    delivery: "3 days",
    art: "WM",
    colors: ["#334155", "#94a3b8"],
    features: ["8 kg capacity", "Steam wash", "10-year motor warranty"],
    offers: ["Exchange up to Rs. 2,500", "No-cost EMI available", "Free demo"],
    seller: "ApplianceMart"
  },
  {
    id: 11,
    name: "GlowUp Beauty Essentials Kit",
    brand: "GlowUp",
    category: "Beauty",
    price: 1199,
    mrp: 2999,
    rating: 4,
    reviews: 19332,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Tomorrow",
    art: "GU",
    colors: ["#c026d3", "#f0abfc"],
    features: ["Cleanser, serum, sunscreen", "Dermatologically tested", "Travel-friendly pack"],
    offers: ["Buy 2 save extra 10%", "SuperCoin deal", "Free samples included"],
    seller: "BeautyBasket"
  },
  {
    id: 12,
    name: "FitTrack Smart Watch",
    brand: "FitTrack",
    category: "Electronics",
    price: 3999,
    mrp: 9999,
    rating: 4.1,
    reviews: 48102,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Today",
    art: "FT",
    colors: ["#111827", "#60a5fa"],
    features: ["Bluetooth calling", "AMOLED display", "120 sports modes"],
    offers: ["Launch price Rs. 3,999", "Free strap on prepaid orders", "1-year warranty"],
    seller: "WearableHub"
  },
  {
    id: 13,
    name: "FarmFresh Grocery Saver Pack",
    brand: "FarmFresh",
    category: "Grocery",
    price: 1299,
    mrp: 1799,
    rating: 4.5,
    reviews: 3021,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Today",
    art: "GR",
    colors: ["#15803d", "#bef264"],
    features: ["Rice, flour, oil, pulses", "Freshly packed staples", "Scheduled delivery slots"],
    offers: ["Extra Rs. 100 off above Rs. 1,499", "Free delivery for Plus", "Combo savings included"],
    seller: "FlipMart Grocery"
  },
  {
    id: 14,
    name: "KitchenPro Mixer Grinder",
    brand: "KitchenPro",
    category: "Appliances",
    price: 2499,
    mrp: 5499,
    rating: 4.1,
    reviews: 15288,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Tomorrow",
    art: "MX",
    colors: ["#dc2626", "#fecaca"],
    features: ["750 W motor", "3 stainless steel jars", "2-year warranty"],
    offers: ["Extra Rs. 200 bank discount", "Free delivery", "Cashback on UPI"],
    seller: "KitchenKart"
  },
  {
    id: 15,
    name: "KidsLearn Tablet",
    brand: "KidsLearn",
    category: "Electronics",
    price: 9999,
    mrp: 17999,
    rating: 3.9,
    reviews: 5302,
    assured: false,
    emi: true,
    exchange: false,
    delivery: "2 days",
    art: "KL",
    colors: ["#f59e0b", "#fde68a"],
    features: ["Parental controls", "Preloaded learning apps", "Rugged protective case"],
    offers: ["Education bundle included", "EMI available", "Free screen guard"],
    seller: "LearningStore"
  },
  {
    id: 16,
    name: "TrailBlaze Rucksack 65L",
    brand: "TrailBlaze",
    category: "Travel",
    price: 1899,
    mrp: 4999,
    rating: 4.2,
    reviews: 9924,
    assured: true,
    emi: false,
    exchange: false,
    delivery: "Tomorrow",
    art: "TB",
    colors: ["#0f766e", "#134e4a"],
    features: ["65L capacity", "Rain cover included", "Padded shoulder support"],
    offers: ["Travel sale extra 12% off", "SuperCoin reward", "Free delivery"],
    seller: "OutdoorKart"
  }
];

const categories = ["All", ...new Set(products.map((product) => product.category))];
const storageKeys = {
  cart: "flipmart-cart",
  wishlist: "flipmart-wishlist",
  user: "flipmart-user"
};

const state = {
  query: "",
  category: "All",
  maxPrice: 89999,
  minRating: 0,
  assuredOnly: false,
  emiOnly: false,
  exchangeOnly: false,
  sort: "popularity",
  cart: readStorage(storageKeys.cart, {}),
  wishlist: readStorage(storageKeys.wishlist, []),
  user: readStorage(storageKeys.user, null),
  slide: 0
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  suggestions: document.querySelector("#suggestions"),
  categoryFilters: document.querySelector("#categoryFilters"),
  priceRange: document.querySelector("#priceRange"),
  priceValue: document.querySelector("#priceValue"),
  clearFilters: document.querySelector("#clearFilters"),
  assuredOnly: document.querySelector("#assuredOnly"),
  emiOnly: document.querySelector("#emiOnly"),
  exchangeOnly: document.querySelector("#exchangeOnly"),
  sortSelect: document.querySelector("#sortSelect"),
  resultSummary: document.querySelector("#resultSummary"),
  productGrid: document.querySelector("#productGrid"),
  dealRow: document.querySelector("#dealRow"),
  cartButton: document.querySelector("#cartButton"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCartButton: document.querySelector("#closeCartButton"),
  overlay: document.querySelector("#overlay"),
  cartCount: document.querySelector("#cartCount"),
  cartItems: document.querySelector("#cartItems"),
  subtotal: document.querySelector("#subtotal"),
  discountTotal: document.querySelector("#discountTotal"),
  deliveryFee: document.querySelector("#deliveryFee"),
  cartTotal: document.querySelector("#cartTotal"),
  productModal: document.querySelector("#productModal"),
  modalContent: document.querySelector("#modalContent"),
  closeProductModal: document.querySelector("#closeProductModal"),
  loginButton: document.querySelector("#loginButton"),
  loginModal: document.querySelector("#loginModal"),
  closeLoginModal: document.querySelector("#closeLoginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginIdentity: document.querySelector("#loginIdentity"),
  loginMessage: document.querySelector("#loginMessage"),
  placeOrderButton: document.querySelector("#placeOrderButton"),
  addressInput: document.querySelector("#addressInput"),
  paymentSelect: document.querySelector("#paymentSelect"),
  checkoutMessage: document.querySelector("#checkoutMessage"),
  pincodeInput: document.querySelector("#pincodeInput"),
  checkPincode: document.querySelector("#checkPincode"),
  pincodeMessage: document.querySelector("#pincodeMessage"),
  dealTimer: document.querySelector("#dealTimer"),
  heroSlides: [...document.querySelectorAll(".hero-slide")],
  sliderDots: document.querySelector("#sliderDots"),
  prevSlide: document.querySelector("#prevSlide"),
  nextSlide: document.querySelector("#nextSlide"),
  menuButton: document.querySelector("#menuButton"),
  closeMenuButton: document.querySelector("#closeMenuButton"),
  mobileMenu: document.querySelector("#mobileMenu"),
  filterToggle: document.querySelector("#filterToggle"),
  filtersPanel: document.querySelector("#filtersPanel")
};

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function discountPercent(product) {
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

function getProduct(id) {
  return products.find((product) => product.id === Number(id));
}

function productArt(product) {
  return `
    <div class="product-art" style="--art-a: ${product.colors[0]}; --art-b: ${product.colors[1]}">
      ${product.art}
    </div>
  `;
}

function init() {
  renderCategoryFilters();
  renderDeals();
  renderProducts();
  renderCart();
  renderCarouselDots();
  updateCarousel();
  updateLoginButton();
  bindEvents();
  startDealTimer();
  setInterval(nextSlide, 6500);
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = elements.searchInput.value.trim();
    elements.suggestions.classList.remove("active");
    renderProducts();
  });

  elements.searchInput.addEventListener("input", () => {
    state.query = elements.searchInput.value.trim();
    renderSuggestions();
    renderProducts();
  });

  elements.searchInput.addEventListener("blur", () => {
    setTimeout(() => elements.suggestions.classList.remove("active"), 120);
  });

  document.querySelectorAll(".category-card").forEach((button) => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.category);
      document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-category-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.categoryJump);
      document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
    });
  });

  elements.priceRange.addEventListener("input", () => {
    state.maxPrice = Number(elements.priceRange.value);
    elements.priceValue.textContent = formatCurrency(state.maxPrice);
    renderProducts();
  });

  document.querySelectorAll('input[name="rating"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.minRating = Number(input.value);
      renderProducts();
    });
  });

  elements.assuredOnly.addEventListener("change", () => {
    state.assuredOnly = elements.assuredOnly.checked;
    renderProducts();
  });

  elements.emiOnly.addEventListener("change", () => {
    state.emiOnly = elements.emiOnly.checked;
    renderProducts();
  });

  elements.exchangeOnly.addEventListener("change", () => {
    state.exchangeOnly = elements.exchangeOnly.checked;
    renderProducts();
  });

  elements.sortSelect.addEventListener("change", () => {
    state.sort = elements.sortSelect.value;
    renderProducts();
  });

  elements.clearFilters.addEventListener("click", clearFilters);
  elements.productGrid.addEventListener("click", handleProductAction);
  elements.dealRow.addEventListener("click", handleProductAction);
  elements.cartItems.addEventListener("click", handleCartAction);

  elements.cartButton.addEventListener("click", openCart);
  elements.closeCartButton.addEventListener("click", closePanels);
  elements.overlay.addEventListener("click", closePanels);

  elements.closeProductModal.addEventListener("click", () => elements.productModal.close());
  elements.loginButton.addEventListener("click", () => showDialog(elements.loginModal));
  elements.closeLoginModal.addEventListener("click", () => elements.loginModal.close());
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.placeOrderButton.addEventListener("click", placeOrder);
  elements.checkPincode.addEventListener("click", checkPincode);
  elements.prevSlide.addEventListener("click", prevSlide);
  elements.nextSlide.addEventListener("click", nextSlide);
  elements.menuButton.addEventListener("click", openMenu);
  elements.closeMenuButton.addEventListener("click", closePanels);
  elements.filterToggle.addEventListener("click", () => elements.filtersPanel.classList.toggle("open"));
}

function renderCategoryFilters() {
  elements.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <label>
          <input type="radio" name="category" value="${category}" ${category === state.category ? "checked" : ""} />
          ${category}
        </label>
      `
    )
    .join("");

  elements.categoryFilters.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => setCategory(input.value));
  });
}

function setCategory(category) {
  state.category = category;
  elements.categoryFilters.querySelectorAll("input").forEach((input) => {
    input.checked = input.value === category;
  });
  document.querySelectorAll(".category-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderProducts();
}

function clearFilters() {
  state.query = "";
  state.category = "All";
  state.maxPrice = 89999;
  state.minRating = 0;
  state.assuredOnly = false;
  state.emiOnly = false;
  state.exchangeOnly = false;
  state.sort = "popularity";
  elements.searchInput.value = "";
  elements.priceRange.value = state.maxPrice;
  elements.priceValue.textContent = formatCurrency(state.maxPrice);
  elements.assuredOnly.checked = false;
  elements.emiOnly.checked = false;
  elements.exchangeOnly.checked = false;
  elements.sortSelect.value = state.sort;
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  renderCategoryFilters();
  document.querySelectorAll(".category-card").forEach((button) => button.classList.remove("active"));
  renderProducts();
}

function filteredProducts() {
  const query = state.query.toLowerCase();
  let list = products.filter((product) => {
    const matchesQuery =
      !query ||
      [product.name, product.brand, product.category, ...product.features].some((value) =>
        value.toLowerCase().includes(query)
      );

    return (
      matchesQuery &&
      (state.category === "All" || product.category === state.category) &&
      product.price <= state.maxPrice &&
      product.rating >= state.minRating &&
      (!state.assuredOnly || product.assured) &&
      (!state.emiOnly || product.emi) &&
      (!state.exchangeOnly || product.exchange)
    );
  });

  list = [...list].sort((a, b) => {
    if (state.sort === "priceLow") return a.price - b.price;
    if (state.sort === "priceHigh") return b.price - a.price;
    if (state.sort === "rating") return b.rating - a.rating;
    if (state.sort === "discount") return discountPercent(b) - discountPercent(a);
    return b.reviews * b.rating - a.reviews * a.rating;
  });

  return list;
}

function renderProducts() {
  const list = filteredProducts();
  elements.resultSummary.textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;

  if (!list.length) {
    elements.productGrid.innerHTML = `
      <div class="empty-state">
        <h3>No products match your filters</h3>
        <p>Try removing a filter, changing the price range, or searching for another brand.</p>
      </div>
    `;
    return;
  }

  elements.productGrid.innerHTML = list.map((product) => productCard(product)).join("");
}

function productCard(product, compact = false) {
  const isWishlisted = state.wishlist.includes(product.id);
  return `
    <article class="product-card ${compact ? "compact" : ""}" data-id="${product.id}">
      ${productArt(product)}
      <div class="product-details">
        <div class="meta-row">
          ${product.assured ? '<span class="assured-badge">Assured</span>' : ""}
          <span class="discount-pill">${discountPercent(product)}% off</span>
        </div>
        <h3>${product.name}</h3>
        <div class="meta-row">
          <span class="rating">${product.rating} star</span>
          <span class="review-count">${product.reviews.toLocaleString("en-IN")} ratings</span>
        </div>
        <ul class="features">
          ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        <div class="price-row">
          <span class="price">${formatCurrency(product.price)}</span>
          <span class="mrp">${formatCurrency(product.mrp)}</span>
          <span class="discount">${discountPercent(product)}% off</span>
        </div>
        <span class="delivery-copy">Delivery by ${product.delivery} | Seller: ${product.seller}</span>
        <div class="card-actions">
          <button class="add-cart" data-action="add-cart" data-id="${product.id}">Add to Cart</button>
          <button class="view-details" data-action="details" data-id="${product.id}">View Details</button>
          <button class="wishlist ${isWishlisted ? "active" : ""}" data-action="wishlist" data-id="${product.id}">
            ${isWishlisted ? "Wishlisted" : "Wishlist"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderDeals() {
  const deals = [...products].sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 5);
  elements.dealRow.innerHTML = deals
    .map(
      (product) => `
        <article class="deal-card" data-id="${product.id}">
          ${productArt(product)}
          <div class="meta-row">
            <span class="discount-pill">${discountPercent(product)}% off</span>
            ${product.assured ? '<span class="assured-badge">Assured</span>' : ""}
          </div>
          <h3>${product.name}</h3>
          <div class="price-row">
            <span class="price">${formatCurrency(product.price)}</span>
            <span class="mrp">${formatCurrency(product.mrp)}</span>
          </div>
          <button class="add-cart" data-action="add-cart" data-id="${product.id}">Grab deal</button>
        </article>
      `
    )
    .join("");
}

function handleProductAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (button.dataset.action === "add-cart") addToCart(id);
  if (button.dataset.action === "details") showProductDetails(id);
  if (button.dataset.action === "wishlist") toggleWishlist(id);
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  writeStorage(storageKeys.cart, state.cart);
  renderCart();
  openCart();
}

function toggleWishlist(id) {
  state.wishlist = state.wishlist.includes(id)
    ? state.wishlist.filter((itemId) => itemId !== id)
    : [...state.wishlist, id];
  writeStorage(storageKeys.wishlist, state.wishlist);
  renderProducts();
  renderDeals();
}

function renderCart() {
  const entries = Object.entries(state.cart)
    .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
    .filter((entry) => entry.product && entry.quantity > 0);

  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.product.mrp * entry.quantity, 0);
  const payable = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const delivery = payable > 499 || payable === 0 ? 0 : 49;

  elements.cartCount.textContent = itemCount;
  elements.subtotal.textContent = formatCurrency(subtotal);
  elements.discountTotal.textContent = `- ${formatCurrency(Math.max(subtotal - payable, 0))}`;
  elements.deliveryFee.textContent = delivery ? formatCurrency(delivery) : "Free";
  elements.cartTotal.textContent = formatCurrency(payable + delivery);

  if (!entries.length) {
    elements.cartItems.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add deals, groceries, fashion, electronics, and more to checkout.</p>
      </div>
    `;
    return;
  }

  elements.cartItems.innerHTML = entries
    .map(
      ({ product, quantity }) => `
        <article class="cart-item" data-id="${product.id}">
          ${productArt(product)}
          <div>
            <strong>${product.name}</strong>
            <div class="price-row">
              <span class="price">${formatCurrency(product.price)}</span>
              <span class="mrp">${formatCurrency(product.mrp)}</span>
            </div>
            <span class="delivery-copy">Delivery by ${product.delivery}</span>
            <div class="quantity-row">
              <button data-cart-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">-</button>
              <strong>${quantity}</strong>
              <button data-cart-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
              <button class="remove-button" data-cart-action="remove" data-id="${product.id}">Remove</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function handleCartAction(event) {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.cartAction;

  if (action === "increase") state.cart[id] = (state.cart[id] || 0) + 1;
  if (action === "decrease") state.cart[id] = Math.max((state.cart[id] || 0) - 1, 0);
  if (action === "remove" || state.cart[id] === 0) delete state.cart[id];

  writeStorage(storageKeys.cart, state.cart);
  renderCart();
}

function showProductDetails(id) {
  const product = getProduct(id);
  if (!product) return;

  elements.modalContent.innerHTML = `
    <article class="modal-product">
      ${productArt(product)}
      <div>
        <p class="eyebrow">${product.category} | ${product.brand}</p>
        <h2>${product.name}</h2>
        <div class="meta-row">
          <span class="rating">${product.rating} star</span>
          <span class="review-count">${product.reviews.toLocaleString("en-IN")} ratings and reviews</span>
          ${product.assured ? '<span class="assured-badge">Assured</span>' : ""}
        </div>
        <div class="price-row">
          <span class="price">${formatCurrency(product.price)}</span>
          <span class="mrp">${formatCurrency(product.mrp)}</span>
          <span class="discount">${discountPercent(product)}% off</span>
        </div>
        <p class="seller-copy">Seller ${product.seller} | Delivery by ${product.delivery} | 7-day replacement policy</p>
        <h3>Available offers</h3>
        <ul class="offer-list">
          ${product.offers.map((offer) => `<li>${offer}</li>`).join("")}
        </ul>
        <h3>Highlights</h3>
        <ul class="spec-list">
          ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
          <li>${product.emi ? "No-cost EMI available" : "Best prepaid and wallet offers available"}</li>
          <li>${product.exchange ? "Exchange available" : "Exchange is not available for this item"}</li>
        </ul>
        <div class="card-actions">
          <button class="add-cart" data-action="modal-add" data-id="${product.id}">Add to Cart</button>
          <button class="view-details" data-action="modal-buy" data-id="${product.id}">Buy Now</button>
        </div>
      </div>
    </article>
  `;

  elements.modalContent.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(product.id);
      elements.productModal.close();
      if (button.dataset.action === "modal-buy") openCart();
    });
  });

  showDialog(elements.productModal);
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  elements.overlay.classList.add("active");
}

function openMenu() {
  elements.mobileMenu.classList.add("open");
  elements.overlay.classList.add("active");
}

function closePanels() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  elements.mobileMenu.classList.remove("open");
  elements.overlay.classList.remove("active");
}

function showDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function handleLogin(event) {
  event.preventDefault();
  const identity = elements.loginIdentity.value.trim();
  state.user = { identity, name: identity.split("@")[0] || "Shopper" };
  writeStorage(storageKeys.user, state.user);
  elements.loginMessage.textContent = `Welcome back, ${state.user.name}. Your account is ready.`;
  updateLoginButton();
  setTimeout(() => elements.loginModal.close(), 700);
}

function updateLoginButton() {
  elements.loginButton.textContent = state.user ? `Hi, ${state.user.name}` : "Login";
}

function placeOrder() {
  const itemCount = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  const address = elements.addressInput.value.trim();

  if (!itemCount) {
    elements.checkoutMessage.textContent = "Add at least one item to place an order.";
    return;
  }

  if (address.length < 12) {
    elements.checkoutMessage.textContent = "Enter a complete delivery address before placing the order.";
    return;
  }

  const orderId = `FM${Date.now().toString().slice(-7)}`;
  state.cart = {};
  writeStorage(storageKeys.cart, state.cart);
  renderCart();
  elements.checkoutMessage.textContent = `Order ${orderId} placed using ${elements.paymentSelect.value}. Track it from Orders.`;
}

function checkPincode() {
  const value = elements.pincodeInput.value.trim();
  if (!/^\d{6}$/.test(value)) {
    elements.pincodeMessage.textContent = "Enter a valid 6-digit pincode.";
    return;
  }

  const fastDelivery = Number(value.slice(-1)) % 2 === 0;
  elements.pincodeMessage.textContent = fastDelivery
    ? "Great news: same-day and next-day delivery are available."
    : "Standard delivery is available with easy returns and installation support.";
}

function renderSuggestions() {
  const query = elements.searchInput.value.trim().toLowerCase();
  if (!query) {
    elements.suggestions.classList.remove("active");
    elements.suggestions.innerHTML = "";
    return;
  }

  const suggestions = products
    .filter((product) => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query))
    .slice(0, 6);

  elements.suggestions.innerHTML = suggestions
    .map((product) => `<button type="button" data-suggestion="${product.name}">${product.name} in ${product.category}</button>`)
    .join("");
  elements.suggestions.classList.toggle("active", suggestions.length > 0);

  elements.suggestions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("mousedown", () => {
      elements.searchInput.value = button.dataset.suggestion;
      state.query = button.dataset.suggestion;
      elements.suggestions.classList.remove("active");
      renderProducts();
    });
  });
}

function renderCarouselDots() {
  elements.sliderDots.innerHTML = elements.heroSlides
    .map((_, index) => `<button aria-label="Go to banner ${index + 1}" data-slide="${index}"></button>`)
    .join("");

  elements.sliderDots.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.slide = Number(button.dataset.slide);
      updateCarousel();
    });
  });
}

function updateCarousel() {
  elements.heroSlides.forEach((slide, index) => {
    slide.classList.toggle("active", index === state.slide);
  });
  elements.sliderDots.querySelectorAll("button").forEach((button, index) => {
    button.classList.toggle("active", index === state.slide);
  });
}

function nextSlide() {
  state.slide = (state.slide + 1) % elements.heroSlides.length;
  updateCarousel();
}

function prevSlide() {
  state.slide = (state.slide - 1 + elements.heroSlides.length) % elements.heroSlides.length;
  updateCarousel();
}

function startDealTimer() {
  let seconds = 2 * 60 * 60;
  setInterval(() => {
    seconds = seconds > 0 ? seconds - 1 : 2 * 60 * 60;
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const remainingSeconds = String(seconds % 60).padStart(2, "0");
    elements.dealTimer.textContent = `${hours}:${minutes}:${remainingSeconds}`;
  }, 1000);
}

init();
