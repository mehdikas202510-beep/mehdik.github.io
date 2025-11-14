// مفاتيح التخزين المحلي
const LS_KEYS = {
  users: "secure_shop_users",
  products: "secure_shop_products",
  cart: "secure_shop_cart",
  currentUser: "secure_shop_current_user",
};

// منتجات افتراضية
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "سماعات لاسلكية",
    price: 39.99,
    image:
      "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 2,
    name: "ساعة ذكية",
    price: 59.99,
    image:
      "https://images.pexels.com/photos/2774062/pexels-photo-2774062.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 3,
    name: "حقيبة ظهر أنيقة",
    price: 24.99,
    image:
      "https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

// ==== أدوات التخزين ====
const getJson = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const setJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// المستخدمون
const getUsers = () => getJson(LS_KEYS.users, []);
const saveUsers = (users) => setJson(LS_KEYS.users, users);
const getCurrentUser = () => getJson(LS_KEYS.currentUser, null);
const saveCurrentUser = (user) =>
  user
    ? setJson(LS_KEYS.currentUser, user)
    : localStorage.removeItem(LS_KEYS.currentUser);

// مالك واحد فقط
const getOwner = () => getUsers().find((u) => u.role === "owner");

// المنتجات / السلة
const getProducts = () => {
  const stored = getJson(LS_KEYS.products, null);
  if (stored) return stored;
  setJson(LS_KEYS.products, DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
};
const saveProducts = (products) => setJson(LS_KEYS.products, products);

const getCart = () => getJson(LS_KEYS.cart, []);
const saveCart = (cart) => setJson(LS_KEYS.cart, cart);

// ==== دوال مساعدة للأمان (hash) ====
// *لاحظ: ما زالت حماية متصفح فقط، لكنها أفضل من حفظ كلمة المرور مباشرة*
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// ==== عناصر DOM ====
const productsGrid = document.getElementById("productsGrid");
const dashboardSection = document.getElementById("dashboard");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const statsProductsCount = document.getElementById("statsProductsCount");
const statsCartCount = document.getElementById("statsCartCount");
const statsUsersCount = document.getElementById("statsUsersCount");
const dashboardProductsList = document.getElementById("dashboardProductsList");
const usersList = document.getElementById("usersList");

const loginBtn = document.getElementById("loginBtn");
const userMenu = document.getElementById("userMenu");
const currentUserRole = document.getElementById("currentUserRole");
const logoutBtn = document.getElementById("logoutBtn");

const authModal = document.getElementById("authModal");
const loginView = document.getElementById("loginView");
const ownerView = document.getElementById("ownerView");
const loginTab = document.getElementById("loginTab");
const ownerTab = document.getElementById("ownerTab");
const closeAuthModal = document.getElementById("closeAuthModal");
const closeOwnerModal = document.getElementById("closeOwnerModal");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const ownerForm = document.getElementById("ownerForm");
const ownerFormError = document.getElementById("ownerFormError");

const createAdminForm = document.getElementById("createAdminForm");
const adminFormError = document.getElementById("adminFormError");

const cartModal = document.getElementById("cartModal");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartModal = document.getElementById("closeCartModal");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productImageInput = document.getElementById("productImage");
const resetFormBtn = document.getElementById("resetFormBtn");

const yearSpan = document.getElementById("year");
const ownerOnlyBlocks = document.querySelectorAll(".owner-only");

// سنة الفوتر
yearSpan.textContent = new Date().getFullYear();

// ==== عرض المنتجات ====
function renderProducts() {
  const products = getProducts();
  productsGrid.innerHTML = "";

  if (!products.length) {
    productsGrid.innerHTML = "<p>لا توجد منتجات بعد.</p>";
    statsProductsCount.textContent = "0";
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image || ""}" alt="${p.name}" class="product-image"
           onerror="this.src='https://via.placeholder.com/400x300?text=No+Image';" />
      <div class="product-title">${p.name}</div>
      <div class="product-price">${p.price.toFixed(2)} $</div>
      <div class="product-footer">
        <button class="btn primary add-to-cart" data-id="${p.id}">إضافة إلى السلة</button>
        <span class="tag">متوفر</span>
      </div>
    `;

    productsGrid.appendChild(card);
  });

  statsProductsCount.textContent = String(products.length);
}

// ==== عرض المنتجات في لوحة التحكم ====
function renderDashboardProducts() {
  const products = getProducts();
  dashboardProductsList.innerHTML = "";

  if (!products.length) {
    dashboardProductsList.classList.add("empty");
    dashboardProductsList.textContent = "لا توجد منتجات.";
    return;
  }

  dashboardProductsList.classList.remove("empty");

  products.forEach((p) => {
    const row = document.createElement("div");
    row.className = "dash-list-item";
    row.innerHTML = `
      <div>
        <span><strong>${p.name}</strong></span>
        <span style="font-size:0.8rem;color:#6b7280;">${p.price.toFixed(2)} $</span>
      </div>
      <div style="display:flex;gap:0.4rem;">
        <button class="btn small ghost edit-product" data-id="${p.id}">تعديل</button>
        <button class="btn small" style="background:#fee2e2;color:#b91c1c;" data-id="${p.id}" data-action="delete">حذف</button>
      </div>
    `;
    dashboardProductsList.appendChild(row);
  });
}

// ==== عرض المستخدمين ====
function renderUsers() {
  const users = getUsers();
  usersList.innerHTML = "";

  if (!users.length) {
    usersList.classList.add("empty");
    usersList.textContent = "لا يوجد أي مستخدم بعد.";
    statsUsersCount.textContent = "0";
    return;
  }

  usersList.classList.remove("empty");
  statsUsersCount.textContent = String(users.length);

  users.forEach((u) => {
    const row = document.createElement("div");
    row.className = "dash-list-item";
    const roleLabel = u.role === "owner" ? "مالك" : "مسؤول";
    row.innerHTML = `
      <div>
        <span><strong>${u.email}</strong></span>
        <span style="font-size:0.8rem;color:#6b7280;">${roleLabel}</span>
      </div>
      <div>
        ${u.role === "owner" ? '<span class="tag">المالك</span>' : ""}
      </div>
    `;
    usersList.appendChild(row);
  });
}

// ==== عرض السلة ====
function renderCart() {
  const cart = getCart();
  const products = getProducts();
  cartItemsEl.innerHTML = "";

  if (!cart.length) {
    cartItemsEl.classList.add("empty");
    cartItemsEl.textContent = "السلة فارغة.";
    cartTotalEl.textContent = "0";
    statsCartCount.textContent = "0";
    return;
  }

  cartItemsEl.classList.remove("empty");

  let total = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;
    const lineTotal = product.price * item.quantity;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "dash-list-item";
    row.innerHTML = `
      <span>${product.name} × ${item.quantity}</span>
      <span>${lineTotal.toFixed(2)} $</span>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = total.toFixed(2);
  statsCartCount.textContent = String(
    cart.reduce((sum, item) => sum + item.quantity, 0)
  );
}

// ==== واجهة الدخول ====
function updateAuthUI() {
  const user = getCurrentUser();
  const owner = getOwner();

  if (user) {
    loginBtn.classList.add("hidden");
    userMenu.classList.remove("hidden");
    currentUserRole.textContent =
      user.role === "owner" ? "مالك المتجر" : "مسؤول النظام";

    dashboardSection.classList.remove("hidden");
    dashboardSubtitle.textContent =
      user.role === "owner"
        ? "مرحبًا، يمكنك إدارة المتجر والمستخدمين من هنا."
        : "مرحبًا، يمكنك إدارة المنتجات من هنا.";

    // فقط المالك يرى الكتل الخاصة به
    ownerOnlyBlocks.forEach((el) => {
      el.style.display = user.role === "owner" ? "" : "none";
    });
  } else {
    loginBtn.classList.remove("hidden");
    userMenu.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    dashboardSubtitle.textContent =
      "سجّل الدخول كمالك أو مسؤول لعرض لوحة التحكم.";
    ownerOnlyBlocks.forEach((el) => {
      el.style.display = "none";
    });
  }

  // في حال عدم وجود مالك، فعّل تبويب إنشاء المالك افتراضيًا
  if (!owner) {
    switchToOwnerView();
  }
}

// ==== مودالات ====
function openModal(el) {
  el.classList.remove("hidden");
}
function closeModal(el) {
  el.classList.add("hidden");
}

// سلة
function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, quantity: 1 });
  saveCart(cart);
  renderCart();
  alert("تم إضافة المنتج إلى السلة ✅");
}

// تبويبات المودال
function switchToLoginView() {
  loginView.classList.remove("hidden");
  ownerView.classList.add("hidden");
  loginTab.classList.add("active");
  ownerTab.classList.remove("active");
}
function switchToOwnerView() {
  loginView.classList.add("hidden");
  ownerView.classList.remove("hidden");
  loginTab.classList.remove("active");
  ownerTab.classList.add("active");
}

// ==== تهيئة الأحداث ====
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderDashboardProducts();
  renderUsers();
  renderCart();
  updateAuthUI();

  // فتح مودال الدخول
  loginBtn.addEventListener("click", () => {
    const owner = getOwner();
    if (!owner) {
      switchToOwnerView();
    } else {
      switchToLoginView();
    }
    openModal(authModal);
  });

  closeAuthModal.addEventListener("click", () => closeModal(authModal));
  closeOwnerModal.addEventListener("click", () => closeModal(authModal));

  // تبديل التبويبات
  loginTab.addEventListener("click", () => switchToLoginView());
  ownerTab.addEventListener("click", () => switchToOwnerView());

  // تسجيل الدخول
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      loginError.textContent = "المستخدم غير موجود.";
      loginError.classList.remove("hidden");
      return;
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      loginError.textContent = "كلمة المرور غير صحيحة.";
      loginError.classList.remove("hidden");
      return;
    }

    saveCurrentUser({ email: user.email, role: user.role });
    loginForm.reset();
    closeModal(authModal);
    updateAuthUI();
  });

  // إنشاء حساب مالك
  ownerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    ownerFormError.classList.add("hidden");
    const email = document.getElementById("ownerEmail").value.trim();
    const pw = document.getElementById("ownerPassword").value;
    const pw2 = document.getElementById("ownerPasswordConfirm").value;

    if (pw !== pw2) {
      ownerFormError.textContent = "كلمتا المرور غير متطابقتين.";
      ownerFormError.classList.remove("hidden");
      return;
    }

    if (getOwner()) {
      ownerFormError.textContent = "يوجد مالك بالفعل. لا يمكن إنشاء مالك آخر.";
      ownerFormError.classList.remove("hidden");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      ownerFormError.textContent = "يوجد مستخدم بهذا البريد مسبقًا.";
      ownerFormError.classList.remove("hidden");
      return;
    }

    const passwordHash = await hashPassword(pw);
    const newOwner = {
      id: Date.now(),
      email,
      passwordHash,
      role: "owner",
      createdAt: new Date().toISOString(),
    };
    users.push(newOwner);
    saveUsers(users);
    ownerForm.reset();
    renderUsers();

    saveCurrentUser({ email, role: "owner" });
    closeModal(authModal);
    updateAuthUI();
    alert("تم إنشاء حساب المالك بنجاح ✅");
  });

  // إنشاء مسؤول
  createAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    adminFormError.classList.add("hidden");
    const current = getCurrentUser();
    if (!current || current.role !== "owner") {
      adminFormError.textContent = "فقط المالك يمكنه إضافة مسؤولين.";
      adminFormError.classList.remove("hidden");
      return;
    }

    const email = document.getElementById("adminEmail").value.trim();
    const pw = document.getElementById("adminPassword").value;

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      adminFormError.textContent = "يوجد مستخدم بهذا البريد بالفعل.";
      adminFormError.classList.remove("hidden");
      return;
    }

    const passwordHash = await hashPassword(pw);
    const adminUser = {
      id: Date.now(),
      email,
      passwordHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    users.push(adminUser);
    saveUsers(users);
    createAdminForm.reset();
    renderUsers();
    alert("تم إضافة المسؤول بنجاح ✅");
  });

  // تسجيل الخروج
  logoutBtn.addEventListener("click", () => {
    saveCurrentUser(null);
    updateAuthUI();
  });

  // فتح / إغلاق السلة
  openCartBtn.addEventListener("click", () => {
    renderCart();
    openModal(cartModal);
  });
  closeCartModal.addEventListener("click", () => closeModal(cartModal));

  // إتمام الشراء (تجريبي)
  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (!cart.length) {
      alert("السلة فارغة.");
      return;
    }
    alert("هذه عملية تجريبية فقط، لم يتم إرسال أي بيانات.");
  });

  // إضافة للسلة من المنتجات
  productsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    addToCart(id);
  });

  // حفظ / تعديل منتج
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = getCurrentUser();
    if (!current) {
      alert("يجب تسجيل الدخول كمالك أو مسؤول لإدارة المنتجات.");
      return;
    }

    const id = productIdInput.value ? Number(productIdInput.value) : null;
    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    const image = productImageInput.value.trim();

    if (!name || isNaN(price)) return;

    let products = getProducts();

    if (id) {
      products = products.map((p) =>
        p.id === id ? { ...p, name, price, image } : p
      );
    } else {
      const newId = products.length
        ? Math.max(...products.map((p) => p.id)) + 1
        : 1;
      products.push({ id: newId, name, price, image });
    }

    saveProducts(products);
    renderProducts();
    renderDashboardProducts();
    productForm.reset();
    productIdInput.value = "";
    alert("تم حفظ المنتج بنجاح ✅");
  });

  resetFormBtn.addEventListener("click", () => {
    productForm.reset();
    productIdInput.value = "";
  });

  // تعديل / حذف منتج من لوحة التحكم
  dashboardProductsList.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-product");
    const deleteBtn =
      e.target.dataset.action && e.target.dataset.action === "delete"
        ? e.target
        : null;

    const products = getProducts();

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;
      productIdInput.value = product.id;
      productNameInput.value = product.name;
      productPriceInput.value = product.price;
      productImageInput.value = product.image || "";
      window.scrollTo({ top: dashboardSection.offsetTop, behavior: "smooth" });
    }

    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
      const newProducts = products.filter((p) => p.id !== id);
      saveProducts(newProducts);
      renderProducts();
      renderDashboardProducts();
    }
  });
});
