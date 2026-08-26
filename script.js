/* =========================================================
   4BITTERZS — CLEAN FRONTEND JAVASCRIPT
   This file intentionally contains ONE implementation of each
   feature. No render override layers are used.

   IMPORTANT: authentication, orders, inventory and admin data
   are still frontend-demo data. Production security comes with
   the backend/database phase.
   ========================================================= */

const BRAND_NAME = "4BITTERZS";
const SUPPORT_EMAIL = "support@4bitterzs.com";
const INSTAGRAM_URL = "https://instagram.com/4bitterzs";
const DEVELOPER_INSTAGRAM_URL = "https://instagram.com/arnav7verma";
const STORE_ADDRESS = "UPES, Bidholi Campus, P.O. Bidholi Via Premnagar, Dehradun - 248007, Uttarakhand, India";

/*
    Frontend contact details for the current prototype.
    Contact delivery will move server-side during the backend phase.
*/

const PRODUCTS=[
{slug:"vantage-cuban-chain",name:"Vantage Cuban Chain",img:"/assets/p1.jpg",price:4299,mrp:6499,category:"chains",material:"925 Sterling Silver",description:"A 7mm diamond-cut cuban link with a hand-polished mirror finish and a reinforced box clasp. Built to sit heavy and hold shape.",details:["7mm width","Reinforced box clasp","Anti-tarnish rhodium finish","Weighs 62g"],sizes:['18"','20"','22"']},
{slug:"crest-signet-ring",name:"Crest Signet Ring",img:"/assets/p2.jpg",price:2899,mrp:3999,category:"rings",material:"925 Sterling Silver",description:"A domed signet with a hand-engraved crest set in oxidised black. Rounded inner band for all-day wear.",details:["18mm face","Oxidised crest detail","Comfort-fit band","Weighs 14g"],sizes:["16","18","20","22"]},
{slug:"spike-hoop-earrings",name:"Spike Hoop Earrings",img:"/assets/p3.jpg",price:1899,mrp:2799,category:"earrings",material:"925 Sterling Silver",description:"Fine 35mm hoops loaded with solid cone spikes. Light on the ear, loud on the eye.",details:["35mm diameter","Solid cast spikes","Hypoallergenic posts","Sold as a pair"],sizes:["One size"]},
{slug:"forge-hammered-cuff",name:"Forge Hammered Cuff",img:"/assets/p4.jpg",price:3499,mrp:4999,category:"bracelets",material:"925 Sterling Silver",description:"A wide open cuff finished with a hand-hammered texture that catches light from every angle.",details:["20mm width","Hand-hammered surface","Adjustable open back","Weighs 41g"],sizes:["S/M","L/XL"]},
{slug:"vigil-cross-pendant",name:"Vigil Cross Pendant",img:"/assets/p5.jpg",price:2299,mrp:3499,category:"chains",material:"925 Sterling Silver",description:"A sandblasted cross pendant with polished edges, hung on a fine cable chain. Quiet, but never plain.",details:["32mm pendant","Sandblasted centre",'Includes 20in cable chain',"Weighs 11g"],sizes:['18"','20"']},
{slug:"onyx-stack-ring-set",name:"Onyx Stack Ring Set",img:"/assets/p6.jpg",price:2699,mrp:3899,category:"rings",material:"925 Silver & Black Onyx",description:"Three slim bands, one set with a cabochon black onyx. Wear stacked or split them across fingers.",details:["Set of 3 bands","Natural black onyx","2mm band width","Weighs 9g total"],sizes:["16","18","20"]}
];
const CATEGORIES=[
{slug:"chains",label:"Chains",blurb:"Heavyweight links and pendants in solid 925 silver."},
{slug:"rings",label:"Rings",blurb:"Signets, stacks and stones cast to be worn daily."},
{slug:"earrings",label:"Earrings",blurb:"Hoops, studs and spikes with real presence."},
{slug:"bracelets",label:"Bracelets",blurb:"Cuffs and chain bracelets with serious weight."}
];
const TICKER=["SHIPS UNDER 48 HOURS","LIMITED QUANTITIES","NO RESTOCKS","925 STERLING SILVER"];


/* =========================================================
   PROMOTIONS / SALES / COUPONS
   ---------------------------------------------------------
   Frontend-demo implementation for the current prototype.
   The backend phase will move these rules server-side so
   customers cannot manipulate prices or coupons.
   ========================================================= */

const DEFAULT_SALE = {
    enabled: false,
    title: "FESTIVE SILVER SALE",
    discount: 20,
    scope: "sitewide",          // sitewide | category | products
    category: "",
    productSlugs: [],
    startDate: "",
    endDate: ""
};

let saleConfig = loadJSON("aurvm-sale-config", DEFAULT_SALE);
let coupons = loadJSON("aurvm-coupons", []);
let appliedCoupon = null;

function normalizeSaleConfig() {
    saleConfig = {
        ...DEFAULT_SALE,
        ...(saleConfig && typeof saleConfig === "object" ? saleConfig : {})
    };
    saleConfig.discount = Math.max(0, Math.min(90, Number(saleConfig.discount || 0)));
    if (!Array.isArray(saleConfig.productSlugs)) saleConfig.productSlugs = [];
}

function saleIsActive() {
    if (!saleConfig.enabled || Number(saleConfig.discount || 0) <= 0) return false;
    const now = Date.now();
    if (saleConfig.startDate && now < new Date(saleConfig.startDate).getTime()) return false;
    if (saleConfig.endDate && now > new Date(saleConfig.endDate).getTime()) return false;
    return true;
}

function productSaleDiscount(product) {
    if (!saleIsActive() || !product) return 0;

    if (saleConfig.scope === "sitewide") return Number(saleConfig.discount || 0);
    if (saleConfig.scope === "category" && product.category === saleConfig.category) {
        return Number(saleConfig.discount || 0);
    }
    if (saleConfig.scope === "products" && saleConfig.productSlugs.includes(product.slug)) {
        return Number(saleConfig.discount || 0);
    }
    return 0;
}

function applySalePricing() {
    PRODUCTS.forEach(product => {
        if (!Number(product.basePrice)) product.basePrice = Number(product.price || 0);
        const discount = productSaleDiscount(product);
        product.price = discount > 0
            ? Math.max(0, Math.round(product.basePrice * (1 - discount / 100)))
            : Number(product.basePrice);
    });
}

function saveSaleConfig() {
    localStorage.setItem("aurvm-sale-config", JSON.stringify(saleConfig));
    applySalePricing();
}

function saveCoupons() {
    localStorage.setItem("aurvm-coupons", JSON.stringify(coupons));
}

function validCoupon(code, subtotal) {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return { ok: false, message: "Enter a coupon code" };

    const coupon = coupons.find(item =>
        String(item.code || "").toUpperCase() === normalized
    );

    if (!coupon || coupon.active === false) {
        return { ok: false, message: "Invalid or inactive coupon" };
    }

    if (coupon.expiresAt && Date.now() > new Date(coupon.expiresAt).getTime()) {
        return { ok: false, message: "This coupon has expired" };
    }

    const minimum = Number(coupon.minOrder || 0);
    if (subtotal < minimum) {
        return { ok: false, message: `Minimum order is ${money(minimum)}` };
    }

    let discount = coupon.type === "fixed"
        ? Number(coupon.value || 0)
        : subtotal * Math.min(100, Number(coupon.value || 0)) / 100;

    discount = Math.max(0, Math.min(subtotal, Math.round(discount)));

    return {
        ok: true,
        coupon,
        discount
    };
}

function checkoutTotals(subtotal, delivery = "standard") {
    const shippingCost = delivery === "express" ? 199 : 0;
    const couponResult = appliedCoupon
        ? validCoupon(appliedCoupon.code, subtotal)
        : { ok: false, discount: 0 };

    if (!couponResult.ok) appliedCoupon = null;

    const couponDiscount = couponResult.ok ? couponResult.discount : 0;
    return {
        subtotal,
        shippingCost,
        couponDiscount,
        total: Math.max(0, subtotal + shippingCost - couponDiscount)
    };
}


const $ = selector => document.querySelector(selector);
const money = value => "Rs. " + Number(value || 0).toLocaleString("en-IN");
const save = product => Math.round(100 - product.price / product.mrp * 100);
const getProduct = slug => PRODUCTS.find(product => product.slug === slug);

let cart = loadJSON("aurvm-cart", []);
let menuOpen = false;
let currentUser = loadJSON("aurvm-user", null);
let adminSession = loadJSON("aurvm-admin-session", null);
let demoOrders = loadJSON("aurvm-orders", []);
let wishlist = [];
let seconds = 12 * 3600;

function loadJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function normalizeAssetPath(path) {
    if (!path) return "/assets/p1.jpg";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
    return path.startsWith("assets/") ? "/" + path : path;
}

/* ---------- Demo product persistence ---------- */
try {
    const savedProducts = loadJSON("aurvm-products", null);
    if (Array.isArray(savedProducts) && savedProducts.length) {
        PRODUCTS.splice(0, PRODUCTS.length, ...savedProducts.map(product => ({
            ...product,
            img: normalizeAssetPath(product.img)
        })));
    }
} catch (error) {}

normalizeSaleConfig();
applySalePricing();

/* ---------- Session migration ---------- */
if (currentUser?.email?.toLowerCase() === "admin@aurvm.com") {
    adminSession = { name: "Admin", email: "admin@aurvm.com" };
    localStorage.setItem("aurvm-admin-session", JSON.stringify(adminSession));
    currentUser = null;
    localStorage.removeItem("aurvm-user");
}

function isAdmin() {
    return adminSession?.email?.toLowerCase() === "admin@aurvm.com";
}

function saveUser(user) {
    currentUser = user;
    adminSession = null;
    localStorage.removeItem("aurvm-admin-session");
    localStorage.setItem("aurvm-user", JSON.stringify(user));
}

function logoutCustomer() {
    currentUser = null;
    localStorage.removeItem("aurvm-user");
    showToast("Logged out");
    navigate("/");
}

function loginAdmin() {
    adminSession = { name: "Admin", email: "admin@aurvm.com" };
    localStorage.setItem("aurvm-admin-session", JSON.stringify(adminSession));
    currentUser = null;
    localStorage.removeItem("aurvm-user");
    navigate("/admin");
}

function logoutAdmin() {
    adminSession = null;
    localStorage.removeItem("aurvm-admin-session");
    navigate("/");
}


/* ---------- Customer authentication ---------- */
function authPage(mode = "login") {
    const isLogin = mode === "login";
    return `
        <main class="auth-wrap">
            <section class="auth-card">
                <p class="eyebrow muted">4BITTERZS ACCOUNT</p>
                <h1>${isLogin ? "WELCOME BACK" : "CREATE ACCOUNT"}</h1>
                <p class="muted" style="font-size:14px;margin-top:10px">
                    ${isLogin ? "Sign in to manage your account and orders." : "Create an account to save your shopping details."}
                </p>
                <form id="authForm" style="margin-top:30px">
                    ${!isLogin ? `<div class="field"><label class="eyebrow muted">NAME</label><input id="authName" required></div>` : ""}
                    <div class="field"><label class="eyebrow muted">EMAIL</label><input id="authEmail" type="email" required></div>
                    <div class="field"><label class="eyebrow muted">PASSWORD</label><input id="authPassword" type="password" minlength="4" required></div>
                    <button class="btn btn-primary" style="width:100%">${isLogin ? "LOGIN" : "CREATE ACCOUNT"}</button>
                </form>
                <p class="auth-switch">
                    ${isLogin ? `Don't have an account? <button id="switchAuth" type="button">Create one</button>` : `Already have an account? <button id="switchAuth" type="button">Login</button>`}
                </p>
            </section>
        </main>
    `;
}

function getUsers() {
    const users = loadJSON("aurvm-users", []);
    return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
    localStorage.setItem("aurvm-users", JSON.stringify(users));
}

function bindAuth(mode) {
    document.querySelector("#switchAuth")?.addEventListener("click", () => {
        navigate(mode === "login" ? "/signup" : "/login");
    });

    document.querySelector("#authForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const email = document.querySelector("#authEmail").value.trim().toLowerCase();
        const password = document.querySelector("#authPassword").value;

        if (mode === "login") {
            const user = getUsers().find(item => item.email === email && item.password === password);
            if (!user) {
                showToast("Account not found or password is incorrect");
                return;
            }
            saveUser({name:user.name,email:user.email});
            loadWishlist();
            showToast("Welcome back!");
        } else {
            const name = document.querySelector("#authName").value.trim();
            const users = getUsers();
            if (users.some(item => item.email === email)) {
                showToast("An account with this email already exists");
                return;
            }
            users.push({name,email,password});
            saveUsers(users);
            saveUser({name,email});
            loadWishlist();
            showToast("Account created!");
        }

        setTimeout(() => navigate("/"), 300);
    });
}

/* ---------- Wishlist ---------- */
function wishlistKey() {
    return currentUser?.email
        ? "aurvm-wishlist:" + currentUser.email.toLowerCase()
        : "aurvm-wishlist:guest";
}

function loadWishlist() {
    if (isAdmin()) {
        wishlist = [];
        return;
    }
    wishlist = loadJSON(wishlistKey(), []);
    if (!Array.isArray(wishlist)) wishlist = [];
}

function saveWishlist() {
    if (isAdmin()) return;
    localStorage.setItem(wishlistKey(), JSON.stringify(wishlist));
}

function isWishlisted(slug) {
    return wishlist.includes(slug);
}

function toggleWishlist(slug) {
    if (isAdmin()) {
        showToast("Wishlist is for customer accounts");
        return;
    }
    if (!getProduct(slug)) return;
    wishlist = isWishlisted(slug)
        ? wishlist.filter(item => item !== slug)
        : [...wishlist, slug];
    saveWishlist();
    showToast(isWishlisted(slug) ? "Added to wishlist" : "Removed from wishlist");
    render();
}

loadWishlist();

/* ---------- Orders ---------- */
function saveOrders() {
    localStorage.setItem("aurvm-orders", JSON.stringify(demoOrders));
}

function customerOrders() {
    if (!currentUser) return [];
    return demoOrders.filter(order =>
        order.userEmail?.toLowerCase() === currentUser.email.toLowerCase()
    );
}

function createOrder(form) {
    if (!currentUser || isAdmin()) {
        showToast("Please log in as a customer before ordering");
        navigate("/login");
        return null;
    }

    const items = cart.map(item => ({
        ...item,
        product: getProduct(item.slug)
    })).filter(item => item.product);

    if (!items.length) {
        showToast("Your cart is empty");
        navigate("/cart");
        return null;
    }

    const subtotal = items.reduce(
        (total, item) => total + item.product.price * item.qty,
        0
    );

    const delivery = form.querySelector('input[name="delivery"]:checked')?.value || "standard";
    const totals = checkoutTotals(subtotal, delivery);

    const order = {
        id: "4BITTERZS" + String(Date.now()).slice(-8),
        date: new Date().toISOString(),
        status: "Processing",
        userEmail: currentUser.email,
        customerName: form.querySelector("#checkoutName")?.value.trim() || currentUser.name,
        total: totals.total,
        subtotal,
        shippingCost: totals.shippingCost,
        couponCode: appliedCoupon?.code || "",
        couponDiscount: totals.couponDiscount,
        delivery,
        items: items.map(item => ({
            slug: item.slug,
            name: item.product.name,
            image: item.product.img,
            price: item.product.price,
            qty: item.qty,
            size: item.size
        })),
        shipping: {
            name: form.querySelector("#checkoutName")?.value.trim() || currentUser.name,
            phone: form.querySelector("#checkoutPhone")?.value.trim() || "",
            address: form.querySelector("#checkoutAddress")?.value.trim() || "",
            city: form.querySelector("#checkoutCity")?.value.trim() || "",
            pincode: form.querySelector("#checkoutPincode")?.value.trim() || ""
        }
    };

    demoOrders.unshift(order);
    saveOrders();
    cart = [];
    persist();
    appliedCoupon = null;
    return order;
}

/* ---------- Clean storefront header ---------- */
function header() {
    return `
        <header class="site-header">
            <a class="sale-bar sale-bar-link" href="/sale" aria-label="View sale products">
                <p class="eyebrow">${saleIsActive() ? `${saleConfig.title.toUpperCase()} \ UPTO ${saleConfig.discount}% OFF` : "FESTIVE SILVER SALE \ UPTO 40% OFF"}</p>
                <div class="countdown" id="countdown"></div>
            </a>

            <div class="navbar">
                <a class="logo" href="/" aria-label="4BITTERZS home">4BITTERZS</a>
                <nav class="nav">${navLinks()}</nav>

                <div class="actions">
                    <button class="icon-btn" id="searchButton" aria-label="Search">
                        ${icon("search")}
                    </button>

                    <a class="icon-btn" href="${isAdmin() ? "/admin" : currentUser ? "/account" : "/login"}" aria-label="Account">
                        ${icon("user")}
                    </a>

                    <a class="icon-btn" href="/wishlist" aria-label="Wishlist" title="Wishlist">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.8 8.7c0 5.4-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.7A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.6Z"/>
                        </svg>
                        <span class="cart-badge wishlist-badge" id="wishlistBadge">${wishlist.length}</span>
                    </a>

                    <a class="icon-btn" href="/cart" aria-label="Cart">
                        ${icon("bag")}
                        <span class="cart-badge">${cartCount()}</span>
                    </a>

                    <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">
                        ${icon(menuOpen ? "x" : "menu")}
                    </button>
                </div>
            </div>

            <nav class="mobile-nav ${menuOpen ? "open" : ""}">
                ${navLinks()}
                <a href="${isAdmin() ? "/admin" : currentUser ? "/account" : "/login"}">${isAdmin() ? "ADMIN" : currentUser ? "ACCOUNT" : "LOGIN"}</a>
                <a href="/wishlist">WISHLIST</a>
                <a href="/cart">CART</a>
            </nav>
        </header>
    `;
}

/* ---------- Final product card ---------- */
function heartIcon(active) {
    return `<svg viewBox="0 0 24 24" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 8.7c0 5.4-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.7A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.6Z"/></svg>`;
}

function productCard(product) {
    const liked = isWishlisted(product.slug);
    return `
        <article class="product-card">
            <div class="media">
                <span class="save">SAVE ${save(product)}%</span>
                ${productSaleDiscount(product) > 0 ? `<span class="sale-badge">SALE -${productSaleDiscount(product)}%</span>` : ""}
                <button type="button" class="wishlist-btn ${liked ? "active" : ""}" data-wishlist="${product.slug}" aria-label="${liked ? "Remove from wishlist" : "Add to wishlist"}">
                    ${heartIcon(liked)}
                </button>
                <a href="/product/${product.slug}">
                    <img src="${product.img}" alt="${product.name}" loading="lazy">
                    <span class="view-product">VIEW PRODUCT</span>
                </a>
            </div>
            <h3><a href="/product/${product.slug}">${product.name}</a></h3>
            <p class="price">${money(product.price)} <span class="old">${money(product.mrp)}</span></p>
        </article>
    `;
}

function productCards(list) {
    return `<div class="grid-products">${list.map(productCard).join("")}</div>`;
}

/* Every storefront list uses the same final product-card renderer. */
function cards(list) {
    return productCards(list);
}

/* ---------- Shop filtering ---------- */
function filteredProducts(category, query, sort, stock) {
    let list = [...PRODUCTS];
    if (category && category !== "all") list = list.filter(p => p.category === category);
    if (query) {
        const q = query.toLowerCase();
        list = list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.material.toLowerCase().includes(q)
        );
    }
    if (stock === "available") list = list.filter(p => demoStock(p.slug) > 0);
    if (stock === "low") list = list.filter(p => demoStock(p.slug) > 0 && demoStock(p.slug) <= 5);
    if (sort === "price-low") list.sort((a,b) => a.price - b.price);
    if (sort === "price-high") list.sort((a,b) => b.price - a.price);
    if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === "discount") list.sort((a,b) => save(b) - save(a));
    return list;
}

/* ---------- Sale landing page ---------- */
function salePage() {
    const discounted = PRODUCTS.filter(product => productSaleDiscount(product) > 0);
    const headline = saleIsActive()
        ? `${saleConfig.title.toUpperCase()} — ${saleConfig.discount}% OFF`
        : "SALE IS CURRENTLY CLOSED";

    return `
        <main class="container sale-page">
            <p class="eyebrow muted">4BITTERZS / SALE</p>
            <h1 class="page-title">${headline}</h1>
            <p class="sale-intro muted">
                ${saleIsActive()
                    ? "Shop every item included in the current promotion. Sale prices are shown on the product cards."
                    : "There is no active sale right now. Check back soon for the next drop."}
            </p>

            ${discounted.length
                ? productCards(discounted)
                : `<div class="empty"><p class="muted">No discounted products are available right now.</p><a class="btn btn-primary" style="margin-top:22px" href="/shop">SHOP ALL PRODUCTS</a></div>`}
        </main>
    `;
}

/* ---------- Clean shop page ---------- */
function shopPage(category) {
    const active = category ? CATEGORIES.find(c => c.slug === category) : null;
    const list = active ? PRODUCTS.filter(p => p.category === category) : PRODUCTS;
    return `
        <main class="container">
            <p class="eyebrow muted">${active ? "COLLECTION" : "ALL PRODUCTS"}</p>
            <h1 class="page-title">${active ? active.label.toUpperCase() : "THE FULL RANGE"}</h1>
            ${active ? `<p class="muted" style="max-width:520px;margin-top:12px;font-size:14px">${active.blurb}</p>` : ""}
            <div class="tabs">
                <a href="/shop" class="${!active ? "active" : ""}">ALL</a>
                ${CATEGORIES.map(c => `<a href="/shop/${c.slug}" class="${active?.slug === c.slug ? "active" : ""}">${c.label.toUpperCase()}</a>`).join("")}
            </div>
            <div class="shop-toolbar">
                <span class="shop-count" id="shopCount">${list.length} PRODUCTS</span>
                <div class="shop-controls">
                    <button class="filter-btn" id="filterToggle">FILTER</button>
                    <select class="sort-select" id="sortProducts">
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name</option>
                        <option value="discount">Biggest Discount</option>
                    </select>
                </div>
            </div>
            <div class="filter-drawer" id="filterDrawer">
                <span class="filter-label">CATEGORY</span>
                <div class="filter-grid">
                    <button class="filter-option active" data-category-filter="all">ALL</button>
                    ${CATEGORIES.map(c => `<button class="filter-option" data-category-filter="${c.slug}">${c.label.toUpperCase()}</button>`).join("")}
                </div>
                <span class="filter-label" style="margin-top:20px">AVAILABILITY</span>
                <div class="filter-grid">
                    <button class="filter-option active" data-stock-filter="all">ALL</button>
                    <button class="filter-option" data-stock-filter="available">IN STOCK</button>
                    <button class="filter-option" data-stock-filter="low">LOW STOCK</button>
                </div>
            </div>
            <div id="shopProducts">${productCards(list)}</div>
        </main>
    `;
}

/* ---------- Clean product page ---------- */
function productPageClean(product) {
    const images = [product.img, product.img, product.img];
    return `
        <main class="container">
            <nav class="eyebrow muted"><a href="/shop">SHOP</a> / <a href="/shop/${product.category}">${product.category.toUpperCase()}</a></nav>
            <div class="product-detail">
                <div class="gallery">
                    <div class="gallery-thumbs">
                        ${images.map((image,i) => `<button class="gallery-thumb ${i===0?"active":""}" data-gallery-image="${i}"><img src="${image}" alt="${product.name} view ${i+1}"></button>`).join("")}
                    </div>
                    <div class="gallery-main">
                        <span class="save">SAVE ${save(product)}%</span>
                        <img id="mainProductImage" src="${images[0]}" alt="${product.name}">
                        <span class="zoom-hint">PRODUCT VIEW</span>
                    </div>
                </div>
                <div class="detail-info">
                    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start">
                        <h1>${product.name.toUpperCase()}</h1>
                        <button type="button" class="wishlist-btn ${isWishlisted(product.slug)?"active":""}" data-wishlist="${product.slug}" style="position:static">${heartIcon(isWishlisted(product.slug))}</button>
                    </div>
                    <p class="detail-price">${money(product.price)} <span class="old">${money(product.mrp)}</span></p>
                    <p class="description">${product.description}</p>
                    <p class="eyebrow muted size-label">SIZE</p>
                    <div class="sizes">${product.sizes.map((s,i) => `<button class="size ${i===0?"selected":""}" data-size="${s}">${s}</button>`).join("")}</div>
                    <div class="detail-actions">
                        <button class="btn btn-primary" id="addBtn">ADD TO CART</button>
                        <button class="btn" id="buyNowBtn">BUY NOW</button>
                    </div>
                    <div class="details">
                        <div><span class="muted">Material</span><span>${product.material}</span></div>
                        ${product.details.map(detail => `<div><span class="muted">${detail}</span></div>`).join("")}
                        <div><span class="muted">Availability</span><span>${demoStock(product.slug)>0?"In Stock":"Sold Out"}</span></div>
                    </div>
                </div>
            </div>
            <section class="related"><h2>YOU MIGHT ALSO LIKE</h2>${productCards(PRODUCTS.filter(p=>p.slug!==product.slug).slice(0,4))}</section>
        </main>
    `;
}

/* ---------- Wishlist page ---------- */
function wishlistPageClean() {
    const products = PRODUCTS.filter(p => isWishlisted(p.slug));
    return `<main class="container"><p class="eyebrow muted">SAVED FOR LATER</p><h1 class="page-title">WISHLIST</h1>${products.length ? productCards(products) : `<div class="empty"><p class="muted">Your wishlist is empty.</p><a class="btn btn-primary" style="margin-top:20px" href="/shop">EXPLORE PRODUCTS</a></div>`}</main>`;
}

/* ---------- Account ---------- */
function accountPageClean() {
    if (!currentUser) return authPage("login");
    const orders = customerOrders();
    return `<main class="container"><p class="eyebrow muted">YOUR ACCOUNT</p><h1 class="page-title">HELLO, ${currentUser.name.toUpperCase()}</h1><div class="account-grid"><aside class="account-menu"><a class="active" href="/account">OVERVIEW</a><a href="/orders">MY ORDERS</a><a href="/wishlist">WISHLIST</a><button id="customerLogout" type="button">LOG OUT</button></aside><section><div class="account-panel"><p class="eyebrow muted">PROFILE</p><h2>ACCOUNT DETAILS</h2><div style="margin-top:22px;display:grid;gap:14px"><div><span class="muted">NAME</span><p>${currentUser.name}</p></div><div><span class="muted">EMAIL</span><p>${currentUser.email}</p></div></div></div><div class="account-panel" style="margin-top:14px"><p class="eyebrow muted">ORDERS</p><h2>${orders.length} ${orders.length===1?"ORDER":"ORDERS"}</h2><a class="btn ${orders.length?"":"btn-primary"}" style="margin-top:18px" href="${orders.length?"/orders":"/shop"}">${orders.length?"VIEW ORDERS":"START SHOPPING"}</a></div></section></div></main>`;
}

/* ---------- Checkout ---------- */
function checkoutPageClean() {
    const items = cart.map(item => ({...item, product:getProduct(item.slug)})).filter(x=>x.product);
    if (!currentUser) return authPage("login");
    if (!items.length) return `<main class="container empty"><h1 class="page-title">YOUR CART IS EMPTY</h1><a class="btn btn-primary" style="margin-top:24px" href="/shop">SHOP THE DROP</a></main>`;
    const subtotal = items.reduce((sum,item)=>sum+item.product.price*item.qty,0);
    const previewTotals = checkoutTotals(subtotal, "standard");
    return `<main class="container"><p class="eyebrow muted">SECURE CHECKOUT</p><h1 class="page-title">CHECKOUT</h1><div class="checkout-layout"><section><div class="checkout-steps"><span class="checkout-step active">01 INFORMATION</span><span class="checkout-step active">02 SHIPPING</span><span class="checkout-step">03 PAYMENT</span></div><form id="checkoutForm"><div class="checkout-card"><h2>CONTACT</h2><div class="checkout-grid"><div class="field full"><label class="eyebrow muted">EMAIL</label><input id="checkoutEmail" type="email" value="${currentUser.email}" required></div></div></div><div class="checkout-card"><h2>SHIPPING ADDRESS</h2><div class="checkout-grid"><div class="field"><label class="eyebrow muted">FULL NAME</label><input id="checkoutName" value="${currentUser.name}" required></div><div class="field"><label class="eyebrow muted">PHONE</label><input id="checkoutPhone" type="tel" required></div><div class="field full"><label class="eyebrow muted">ADDRESS</label><textarea id="checkoutAddress" rows="3" required></textarea></div><div class="field"><label class="eyebrow muted">CITY</label><input id="checkoutCity" required></div><div class="field"><label class="eyebrow muted">PINCODE</label><input id="checkoutPincode" inputmode="numeric" required></div></div></div><div class="checkout-card"><h2>DELIVERY</h2><div class="checkout-radio-list"><label class="checkout-radio"><input type="radio" name="delivery" value="standard" checked> Standard Delivery — Free</label><label class="checkout-radio"><input type="radio" name="delivery" value="express"> Express Delivery — Rs. 199</label></div></div><div class="checkout-card"><h2>COUPON CODE</h2><div class="coupon-apply-row"><input id="checkoutCoupon" value="${appliedCoupon?.code || ""}" placeholder="ENTER COUPON CODE" autocomplete="off"><button class="btn" type="button" id="applyCoupon">APPLY</button></div><p id="couponMessage" class="muted" style="margin-top:10px">${appliedCoupon ? `Applied: ${appliedCoupon.code}` : ""}</p></div><div class="checkout-card"><h2>PAYMENT</h2><p class="muted" style="margin-top:10px;line-height:1.6">Payment integration will be connected in the backend phase. This button creates a demo order only.</p><div class="checkout-actions"><button class="btn btn-primary" type="submit">PLACE DEMO ORDER</button><a class="btn" href="/cart">BACK TO CART</a></div></div></form></section><aside class="checkout-summary"><h2>ORDER SUMMARY</h2><div id="checkoutSummaryItems">${items.map(item=>`<div class="checkout-product"><img src="${item.product.img}" alt="${item.product.name}"><div style="flex:1"><p style="font-size:13px">${item.product.name}</p><p class="muted">${item.qty} × ${money(item.product.price)}</p></div><strong>${money(item.product.price*item.qty)}</strong></div>`).join("")}</div><div class="summary-line" style="margin-top:20px"><span class="muted">Subtotal</span><span id="checkoutSubtotal">${money(subtotal)}</span></div><div class="summary-line"><span class="muted">Shipping</span><span id="checkoutShipping">FREE</span></div><div class="summary-line" id="checkoutDiscountRow" style="${previewTotals.couponDiscount ? "" : "display:none"}"><span class="muted">Coupon</span><span id="checkoutDiscount">-${money(previewTotals.couponDiscount)}</span></div><div class="summary-line summary-total"><span>TOTAL</span><strong id="checkoutTotal">${money(previewTotals.total)}</strong></div></aside></div></main>`;
}

/* ---------- Orders ---------- */
function ordersPageClean() {
    if (!currentUser) return authPage("login");
    const orders = customerOrders();
    return `<main class="container"><p class="eyebrow muted">ACCOUNT</p><h1 class="page-title">MY ORDERS</h1>${orders.length?`<div class="order-list">${orders.map(order=>`<article class="order-card"><div><h3>#${order.id}</h3><p class="muted">${new Date(order.date).toLocaleDateString("en-IN")}</p><span class="status-pill">${order.status.toUpperCase()}</span></div><div style="text-align:right"><strong>${money(order.total)}</strong><div><a class="btn" style="padding:8px 12px;margin-top:10px" href="/order/${order.id}">VIEW ORDER</a></div></div></article>`).join("")}</div>`:`<div class="empty"><p class="muted">You haven't placed any orders yet.</p><a class="btn btn-primary" style="margin-top:22px" href="/shop">START SHOPPING</a></div>`}</main>`;
}

function customerOrderDetailClean(order) {
    if (!order || !currentUser || order.userEmail?.toLowerCase() !== currentUser.email.toLowerCase()) return notFound();
    return `<main class="container"><p class="eyebrow muted">MY ORDER</p><h1 class="page-title">#${order.id}</h1><div class="order-detail-layout"><section><div class="checkout-card"><p class="eyebrow muted">STATUS</p><h2 style="margin-top:6px">${order.status.toUpperCase()}</h2><p class="muted" style="margin-top:10px">Placed ${new Date(order.date).toLocaleDateString("en-IN")}.</p></div><div class="order-items">${order.items.map(item=>`<div class="order-item"><img src="${item.image}" alt="${item.name}"><div style="flex:1"><strong>${item.name}</strong><p class="muted">Size ${item.size} · Qty ${item.qty}</p></div><strong>${money(item.price*item.qty)}</strong></div>`).join("")}</div></section><aside class="summary"><h2>SHIPPING</h2><div class="summary-line"><span class="muted">Name</span><span>${order.shipping.name}</span></div><div class="summary-line"><span class="muted">Phone</span><span>${order.shipping.phone||"—"}</span></div><div class="summary-line"><span class="muted">Address</span><span style="text-align:right">${order.shipping.address}<br>${order.shipping.city||""} ${order.shipping.pincode||""}</span></div><div class="summary-line"><span class="muted">Shipping</span><span>${order.shippingCost?money(order.shippingCost):"FREE"}</span></div><div class="summary-line summary-total"><span>TOTAL</span><strong>${money(order.total)}</strong></div></aside></div></main>`;
}

/* ---------- Admin views ---------- */
/* ---------- Clean admin portal ---------- */
function adminNav(active) {
    const item = (href, label, key) => `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`;
    return `
        <aside class="admin-portal-sidebar">
            <a class="admin-brand" href="/" title="Back to storefront">4BITTERZS ADMIN</a>
            <div class="admin-nav-label">MANAGEMENT</div>
            ${item("/admin", "Dashboard", "dashboard")}
            ${item("/admin/products", "Products", "products")}
            ${item("/admin/orders", "Orders", "orders")}
            ${item("/admin/customers", "Customers", "customers")}
            ${item("/admin/promotions", "Promotions", "promotions")}
            <div class="admin-nav-label">STORE</div>
            ${item("/", "View Store", "store")}
            ${item("/admin/settings", "Settings", "settings")}
            <div class="admin-sidebar-bottom">
                <button id="adminLogout" type="button">Log Out</button>
            </div>
        </aside>
    `;
}

function adminShell(active, content) {
    return `
        <main class="admin-portal">
            ${adminNav(active)}
            <section class="admin-portal-main">
                <header class="admin-portal-topbar">
                    <span class="eyebrow">4BITTERZS STORE ADMIN</span>
                    <span class="muted">${adminSession?.email || ""}</span>
                </header>
                <div class="admin-portal-content">${content}</div>
            </section>
        </main>
    `;
}

function adminLoginPage() {
    return `<main class="admin-login-page"><section class="admin-login-card"><p class="eyebrow muted">4BITTERZS / ADMIN</p><h1>ADMIN LOGIN</h1><form id="adminLoginForm" style="margin-top:30px"><div class="field"><label class="eyebrow muted">EMAIL</label><input id="adminEmail" type="email" value="admin@aurvm.com" required></div><div class="field"><label class="eyebrow muted">PASSWORD</label><input id="adminPassword" type="password" placeholder="admin123" required></div><button class="btn btn-primary" style="width:100%">ENTER ADMIN PORTAL</button></form><p class="muted" style="font-size:11px;margin-top:18px;line-height:1.6">Frontend demo credentials only. Real authentication will move to the backend.</p><a class="btn" style="width:100%;text-align:center;margin-top:10px" href="/">BACK TO STORE</a></section></main>`;
}

/* ---------- Navigation ---------- */
function navigate(path) {
    history.pushState({}, "", path);
    menuOpen = false;
    render();
}

function bindInternalLinks() {
    document.querySelectorAll("a[href^='/']").forEach(link => {
        if (link.dataset.bound === "true") return;
        link.dataset.bound = "true";
        link.addEventListener("click", event => {
            if (link.target === "_blank") return;
            event.preventDefault();
            navigate(link.getAttribute("href"));
        });
    });
}

/* ---------- Clean event binding ---------- */
function bindStore() {
    document.querySelector("#menuBtn")?.addEventListener("click", () => {
        menuOpen = !menuOpen;
        render();
    });

    document.querySelector("#searchButton")?.addEventListener("click", openSearchClean);

    document.querySelectorAll("[data-wishlist]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(button.dataset.wishlist);
        });
    });

    document.querySelectorAll(".size").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".size").forEach(item => item.classList.remove("selected"));
            button.classList.add("selected");
        });
    });

    document.querySelector("#addBtn")?.addEventListener("click", () => {
        const product = getProduct(location.pathname.split("/")[2]);
        if (!product) return;
        const size = document.querySelector(".size.selected")?.dataset.size || product.sizes[0];
        addCart(product.slug, size);
        showToast("Added to cart");
    });

    document.querySelector("#buyNowBtn")?.addEventListener("click", () => {
        const product = getProduct(location.pathname.split("/")[2]);
        if (!product) return;
        const size = document.querySelector(".size.selected")?.dataset.size || product.sizes[0];
        const existing = cart.filter(item => !item.buyNow);
        cart = [...existing, { slug: product.slug, size, qty: 1, buyNow: true }];
        persist();
        navigate("/checkout");
    });

    document.querySelectorAll("[data-minus]").forEach(button => button.addEventListener("click", () => {
        const [slug,size] = button.dataset.minus.split("|");
        const item = cart.find(x => x.slug === slug && x.size === size);
        setQty(slug,size,(item?.qty || 1)-1);
        render();
    }));

    document.querySelectorAll("[data-plus]").forEach(button => button.addEventListener("click", () => {
        const [slug,size] = button.dataset.plus.split("|");
        const item = cart.find(x => x.slug === slug && x.size === size);
        setQty(slug,size,(item?.qty || 0)+1);
        render();
    }));

    document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
        const [slug,size] = button.dataset.remove.split("|");
        removeCart(slug,size);
        render();
    }));

    document.querySelector("#checkout")?.addEventListener("click", () => {
        if (!currentUser) return navigate("/login");
        navigate("/checkout");
    });

    document.querySelector("#customerLogout")?.addEventListener("click", logoutCustomer);

    document.querySelectorAll("[data-gallery-image]").forEach(button => button.addEventListener("click", () => {
        const product = getProduct(location.pathname.split("/")[2]);
        if (!product) return;
        document.querySelector("#mainProductImage").src = product.img;
        document.querySelectorAll(".gallery-thumb").forEach(x => x.classList.remove("active"));
        button.classList.add("active");
    }));

    document.querySelector("#filterToggle")?.addEventListener("click", () => document.querySelector("#filterDrawer")?.classList.toggle("open"));

    const shopProducts = document.querySelector("#shopProducts");
    if (shopProducts) {
        let selectedCategory = "all";
        let selectedStock = "all";
        let selectedSort = "featured";
        const refresh = () => {
            const list = filteredProducts(selectedCategory,"",selectedSort,selectedStock);
            shopProducts.innerHTML = productCards(list);
            const count = document.querySelector("#shopCount");
            if (count) count.textContent = `${list.length} PRODUCTS`;
            bindStore();
            bindInternalLinks();
        };
        document.querySelectorAll("[data-category-filter]").forEach(button => button.addEventListener("click", () => {
            selectedCategory = button.dataset.categoryFilter;
            document.querySelectorAll("[data-category-filter]").forEach(x => x.classList.remove("active"));
            button.classList.add("active");
            refresh();
        }));
        document.querySelectorAll("[data-stock-filter]").forEach(button => button.addEventListener("click", () => {
            selectedStock = button.dataset.stockFilter;
            document.querySelectorAll("[data-stock-filter]").forEach(x => x.classList.remove("active"));
            button.classList.add("active");
            refresh();
        }));
        document.querySelector("#sortProducts")?.addEventListener("change", event => {
            selectedSort = event.target.value;
            refresh();
        });
    }

    document.querySelector("#applyCoupon")?.addEventListener("click", () => {
        const code = document.querySelector("#checkoutCoupon")?.value.trim().toUpperCase();
        const subtotal = cart.reduce((sum, item) => {
            const product = getProduct(item.slug);
            return sum + (product ? product.price * item.qty : 0);
        }, 0);
        const result = validCoupon(code, subtotal);
        const message = document.querySelector("#couponMessage");
        if (!result.ok) {
            appliedCoupon = null;
            if (message) message.textContent = result.message;
            showToast(result.message);
            return;
        }
        appliedCoupon = result.coupon;
        if (message) message.textContent = `Applied: ${result.coupon.code} — ${money(result.discount)} off`;
        showToast("Coupon applied");
        render();
    });

    document.querySelector("#checkoutForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const order = createOrder(event.currentTarget);
        if (!order) return;
        navigate("/order/" + order.id);
    });

    document.querySelectorAll('input[name="delivery"]').forEach(input => input.addEventListener("change", () => {
        const subtotal = cart.reduce((sum,item) => {
            const p = getProduct(item.slug);
            return sum + (p ? p.price * item.qty : 0);
        },0);
        const delivery = document.querySelector('input[name="delivery"]:checked')?.value || "standard";
        const totals = checkoutTotals(subtotal, delivery);
        const shipEl = document.querySelector("#checkoutShipping");
        const discountEl = document.querySelector("#checkoutDiscount");
        const discountRow = document.querySelector("#checkoutDiscountRow");
        const totalEl = document.querySelector("#checkoutTotal");
        if (shipEl) shipEl.textContent = totals.shippingCost ? money(totals.shippingCost) : "FREE";
        if (discountEl) discountEl.textContent = totals.couponDiscount ? `-${money(totals.couponDiscount)}` : "";
        if (discountRow) discountRow.style.display = totals.couponDiscount ? "" : "none";
        if (totalEl) totalEl.textContent = money(totals.total);
    }));

    document.querySelector("#contactForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const box = document.querySelector("#contactBox");
        if (box) box.innerHTML = `<div style="border:1px solid var(--border);padding:32px"><h2 style="font-size:36px">MESSAGE SENT</h2><p class="muted">Thanks for reaching out — the studio will get back to you shortly.</p></div>`;
    });
}

/* ---------- Admin event binding ---------- */
function bindAdmin() {
    document.querySelector("#adminLoginForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const email = document.querySelector("#adminEmail").value.trim().toLowerCase();
        const password = document.querySelector("#adminPassword").value.trim();
        if (email !== "admin@aurvm.com" || password !== "admin123") {
            showToast("Invalid admin credentials");
            return;
        }
        loginAdmin();
    });

    document.querySelector("#adminLogout")?.addEventListener("click", logoutAdmin);

    document.querySelectorAll("[data-v3-delete-product]").forEach(button => button.addEventListener("click", () => {
        const slug = button.dataset.v3DeleteProduct;
        const index = PRODUCTS.findIndex(p => p.slug === slug);
        if (index < 0 || !confirm("Delete this product?")) return;
        PRODUCTS.splice(index,1);
        localStorage.setItem("aurvm-products",JSON.stringify(PRODUCTS));
        showToast("Product deleted");
        render();
    }));

    document.querySelectorAll("[data-order-status]").forEach(select => select.addEventListener("change", () => {
        const order = demoOrders.find(o => o.id === select.dataset.orderStatus);
        if (!order) return;
        order.status = select.value;
        saveOrders();
        showToast("Order status updated");
    }));

    document.querySelector("#clearDemoOrders")?.addEventListener("click", () => {
        if (!confirm("Clear all demo orders?")) return;
        demoOrders = [];
        saveOrders();
        showToast("Demo orders cleared");
        render();
    });

    document.querySelector("#saleScope")?.addEventListener("change", event => {
        const isCategory = event.target.value === "category";
        const isProducts = event.target.value === "products";
        const categoryWrap = document.querySelector("#saleCategoryWrap");
        const productsWrap = document.querySelector("#saleProductsWrap");
        if (categoryWrap) categoryWrap.style.display = isCategory ? "" : "none";
        if (productsWrap) productsWrap.style.display = isProducts ? "" : "none";
    });

    document.querySelector("#saleAdminForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const scope = document.querySelector("#saleScope")?.value || "sitewide";
        const discount = Math.max(1, Math.min(90, Number(document.querySelector("#saleDiscount")?.value || 0)));
        const start = document.querySelector("#saleStart")?.value || "";
        const end = document.querySelector("#saleEnd")?.value || "";

        if (start && end && new Date(end) <= new Date(start)) {
            showToast("Sale end date must be after the start date");
            return;
        }

        saleConfig = {
            enabled: document.querySelector("#saleEnabled")?.checked || false,
            title: document.querySelector("#saleTitle")?.value.trim() || "FESTIVE SILVER SALE",
            discount,
            scope,
            category: document.querySelector("#saleCategory")?.value || "",
            productSlugs: [...document.querySelectorAll('input[name="saleProduct"]:checked')].map(input => input.value),
            startDate: start,
            endDate: end
        };

        if (scope === "category" && !saleConfig.category) {
            showToast("Choose a category for the sale");
            return;
        }
        if (scope === "products" && !saleConfig.productSlugs.length) {
            showToast("Select at least one product");
            return;
        }

        saveSaleConfig();
        showToast(saleConfig.enabled ? "Sale saved" : "Sale saved as inactive");
        render();
    });

    document.querySelector("#disableSale")?.addEventListener("click", () => {
        saleConfig.enabled = false;
        saveSaleConfig();
        showToast("Sale turned off");
        render();
    });

    document.querySelector("#couponAdminForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const code = document.querySelector("#couponCode")?.value.trim().toUpperCase().replace(/\\s+/g, "-");
        const type = document.querySelector("#couponType")?.value || "percent";
        const value = Number(document.querySelector("#couponValue")?.value || 0);
        const minOrder = Math.max(0, Number(document.querySelector("#couponMinOrder")?.value || 0));
        const expiresAt = document.querySelector("#couponExpiry")?.value || "";
        const active = document.querySelector("#couponActive")?.checked !== false;

        if (!code || value <= 0) {
            showToast("Enter a valid coupon code and value");
            return;
        }
        if (type === "percent" && value > 100) {
            showToast("Percentage cannot exceed 100%");
            return;
        }
        if (expiresAt && Date.now() >= new Date(expiresAt).getTime()) {
            showToast("Coupon expiry must be in the future");
            return;
        }
        if (coupons.some(item => String(item.code).toUpperCase() === code)) {
            showToast("That coupon code already exists");
            return;
        }

        coupons.unshift({
            code,
            type,
            value,
            minOrder,
            expiresAt,
            active,
            createdAt: new Date().toISOString()
        });
        saveCoupons();
        showToast("Coupon created");
        render();
    });

    document.querySelectorAll("[data-coupon-toggle]").forEach(button => button.addEventListener("click", () => {
        const coupon = coupons.find(item => String(item.code).toUpperCase() === button.dataset.couponToggle.toUpperCase());
        if (!coupon) return;
        coupon.active = coupon.active === false;
        saveCoupons();
        render();
    }));

    document.querySelectorAll("[data-coupon-delete]").forEach(button => button.addEventListener("click", () => {
        const code = button.dataset.couponDelete;
        if (!confirm(`Delete coupon ${code}?`)) return;
        coupons = coupons.filter(item => String(item.code).toUpperCase() !== code.toUpperCase());
        if (appliedCoupon?.code?.toUpperCase() === code.toUpperCase()) appliedCoupon = null;
        saveCoupons();
        showToast("Coupon deleted");
        render();
    }));

    document.querySelector("#productAdminForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const slugInput = document.querySelector("#adminProductSlug").value.trim();
        const name = document.querySelector("#adminProductName").value.trim();
        const slug = slugInput || name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
        const product = {
            slug,
            name,
            category: document.querySelector("#adminProductCategory").value,
            price: Number(document.querySelector("#adminProductPrice").value),
            basePrice: Number(document.querySelector("#adminProductPrice").value),
            mrp: Number(document.querySelector("#adminProductMrp").value),
            img: normalizeAssetPath(document.querySelector("#adminProductImage").value.trim()),
            description: document.querySelector("#adminProductDescription").value.trim(),
            material: "925 Sterling Silver",
            details: ["Premium 925 sterling silver", "Anti-tarnish finish"],
            sizes: ["One size"]
        };
        const existing = PRODUCTS.findIndex(p => p.slug === slugInput);
        if (existing >= 0) PRODUCTS[existing] = {...PRODUCTS[existing],...product};
        else PRODUCTS.push(product);
        localStorage.setItem("aurvm-products",JSON.stringify(PRODUCTS));
        showToast(existing >= 0 ? "Product updated" : "Product added");
        navigate("/admin/products");
    });
}

/* ---------- Search ---------- */
function searchProductResults(query) {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.material.toLowerCase().includes(q));
}

function openSearchClean() {
    document.querySelector("#searchPanel")?.remove();
    document.body.insertAdjacentHTML("beforeend", searchPanel());
    const panel = document.querySelector("#searchPanel");
    panel.classList.add("open");
    const input = document.querySelector("#searchInput");
    input?.focus();
    document.querySelector("#searchClose")?.addEventListener("click", closeSearch);
    input?.addEventListener("input", () => {
        document.querySelector("#searchResults").innerHTML = productCards(searchProductResults(input.value));
        bindInternalLinks();
        bindStore();
    });
}

/* ---------- Route definitions ---------- */
const ROUTES = {
    store: ["/", "/shop", "/about", "/contact", "/shipping-returns", "/size-guide", "/care-guide", "/cart", "/wishlist", "/account", "/orders", "/checkout", "/login", "/signup"],
    admin: ["/admin", "/admin/products", "/admin/orders", "/admin/customers", "/admin/promotions", "/admin/settings", "/admin/add"]
};

function normalizedPath() {
    const path = location.pathname.replace(/\/+$/, "");
    return path || "/";
}

/* ---------- Router ---------- */
function render() {
    loadWishlist();
    const path = normalizedPath();

    const segments = path.split("/").filter(Boolean);

    /* ---------- Admin route tree ---------- */
    if (path === "/admin" || path.startsWith("/admin/")) {
        let content;

        if (!isAdmin()) {
            content = adminLoginPage();
        } else if (path === "/admin") {
            content = adminDashboard();
        } else if (path === "/admin/products") {
            content = adminProducts();
        } else if (path === "/admin/orders") {
            content = adminOrders();
        } else if (segments[1] === "orders" && segments.length === 3) {
            content = adminOrderDetail(
                demoOrders.find(order => order.id === segments[2])
            );
        } else if (path === "/admin/customers") {
            content = adminCustomers();
        } else if (path === "/admin/settings") {
            content = adminSettings();
        } else if (path === "/admin/promotions") {
            content = adminPromotions();
        } else if (path === "/admin/add") {
            content = adminProductFormPage();
        } else if (segments[1] === "edit" && segments.length === 3) {
            const product = getProduct(segments[2]);
            content = product ? adminProductFormPage(product) : notFound();
        } else {
            content = notFound();
        }

        document.querySelector("#app").innerHTML = content;
        bindAdmin();
        bindInternalLinks();
        window.scrollTo(0,0);
        return;
    }

    if (isAdmin() && ["/account","/orders","/checkout"].includes(path)) {
        navigate("/admin");
        return;
    }

    let content;
    if (path === "/") content = home();
    else if (path === "/shop") content = shopPage();
    else if (path === "/sale") content = salePage();
    else if (segments[0] === "shop" && segments.length === 2) {
        const category = segments[1];
        content = CATEGORIES.some(item => item.slug === category)
            ? shopPage(category)
            : notFound();
    }
    else if (segments[0] === "product" && segments.length === 2) {
        const p = getProduct(segments[1]);
        content = p ? productPageClean(p) : notFound();
    }
    else if (path === "/about") content = about();
    else if (path === "/contact") content = contact();
    else if (path === "/shipping-returns") content = shippingReturnsPage();
    else if (path === "/size-guide") content = sizeGuidePage();
    else if (path === "/care-guide") content = careGuidePage();
    else if (path === "/cart") content = cartPage();
    else if (path === "/wishlist") content = wishlistPageClean();
    else if (path === "/account") content = accountPageClean();
    else if (path === "/orders") content = ordersPageClean();
    else if (path === "/checkout") content = checkoutPageClean();
    else if (segments[0] === "order" && segments.length === 2) {
        content = customerOrderDetailClean(
            demoOrders.find(order => order.id === segments[1])
        );
    }
    else if (path === "/login") content = authPage("login");
    else if (path === "/signup") content = authPage("signup");
    else content = notFound();

    document.querySelector("#app").innerHTML = header() + content + footer();
    updateBadge();
    const wb = document.querySelector("#wishlistBadge");
    if (wb) { wb.textContent = wishlist.length; wb.style.display = wishlist.length ? "flex" : "none"; }
    bindStore();
    bindAuth(location.pathname === "/signup" ? "signup" : "login");
    bindInternalLinks();
    window.scrollTo(0,0);
}

/* ---------- Countdown ---------- */
function tick() {
    seconds = Math.max(0, seconds - 1);
    const d = Math.floor(seconds / 86400);
    const h = Math.floor(seconds % 86400 / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = seconds % 60;
    const el = $("#countdown");
    if (el) el.innerHTML = [[d,"DAY"],[h,"HRS"],[m,"MIN"],[s,"SEC"]].map(x => `<div><div class="num">${String(x[0]).padStart(2,"0")}</div><small>${x[1]}</small></div>`).join("");
}

window.addEventListener("popstate", render);
document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSearch();
    if (event.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        openSearchClean();
    }
});

/* One initialization point. */
render();
tick();
setInterval(tick, 1000);

/* ---------- Reusable view functions ---------- */
function cartCount(){return cart.reduce((n,x)=>n+x.qty,0)}

function persist(){localStorage.setItem("aurvm-cart",JSON.stringify(cart));updateBadge()}

function updateBadge(){document.querySelectorAll(".cart-badge").forEach(e=>{const n=cartCount();e.textContent=n;e.style.display=n?"flex":"none"})}

function addCart(slug,size,qty=1){let x=cart.find(i=>i.slug===slug&&i.size===size);if(x)x.qty+=qty;else cart.push({slug,size,qty});persist()}

function removeCart(slug,size){cart=cart.filter(i=>!(i.slug===slug&&i.size===size));persist()}

function setQty(slug,size,qty){cart=cart.map(i=>i.slug===slug&&i.size===size?{...i,qty}:i).filter(i=>i.qty>0);persist()}

function icon(type){
 const paths={search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',user:'<circle cx="12" cy="7" r="4"></circle><path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>',bag:'<path d="M5 8h14l-1 13H6L5 8Z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>',menu:'<path d="M4 6h16M4 12h16M4 18h16"></path>',x:'<path d="M5 5l14 14M19 5 5 19"></path>'};
 return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${paths[type]}</svg>`;
}

function navLinks(){return `<a href="/shop">NEW DROPS</a>${CATEGORIES.map(c=>`<a href="/shop/${c.slug}">${c.label.toUpperCase()}</a>`).join("")}<a href="/about">ABOUT</a><a href="/contact">CONTACT</a>`}

function footer(){
    return `
        <footer>

            <div class="footer-grid">

                <div>
                    <p class="footer-logo">${BRAND_NAME}</p>

                    <p
                        class="muted"
                        style="max-width:280px;font-size:14px;margin-top:12px"
                    >
                        Heavyweight silver jewellery for people who don't do subtle.
                    </p>

                    <a
                        class="footer-instagram"
                        href="${INSTAGRAM_URL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:inline-block;margin-top:18px"
                    >
                        INSTAGRAM @4BITTERZS ↗
                    </a>
                </div>

                <div>
                    <h3>SHOP</h3>
                    <ul>
                        ${CATEGORIES.map(c =>
                            `<li><a href="/shop/${c.slug}">${c.label}</a></li>`
                        ).join("")}
                    </ul>
                </div>

                <div>
                    <h3>HELP</h3>
                    <ul>
                        <li><a href="/shipping-returns">Shipping & Returns</a></li>
                        <li><a href="/size-guide">Size Guide</a></li>
                        <li><a href="/care-guide">Care Guide</a></li>
                        <li><a href="/cart">Your Cart</a></li>
                    </ul>
                </div>

                <div>
                    <h3>BRAND</h3>
                    <ul>
                        <li><a href="/about">Our Story</a></li>
                        <li><a href="/shop">All Products</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li>
                            <a
                                href="${INSTAGRAM_URL}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Instagram
                            </a>
                        </li>
                    </ul>
                </div>

            </div>

            <div
                class="footer-contact"
                style="border-top:1px solid var(--border);margin-top:36px;padding-top:24px;display:flex;flex-wrap:wrap;gap:12px 28px;font-size:13px"
            >
                <a href="mailto:${SUPPORT_EMAIL}">
                    ${SUPPORT_EMAIL}
                </a>

                <span class="muted">
                    ${STORE_ADDRESS}
                </span>
            </div>

            <div
                class="footer-bottom"
                style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:26px"
            >
                <p class="copyright">
                    © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                </p>

                <p class="copyright">
                    Developed by
                    <a
                        href="${DEVELOPER_INSTAGRAM_URL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Arnav Verma ↗
                    </a>
                </p>
            </div>

        </footer>
    `;
}

function categories(){return `<div class="category-grid">${CATEGORIES.map(c=>`<a class="category-tile" href="/shop/${c.slug}"><h3>${c.label.toUpperCase()}</h3><p>${c.blurb}</p><p class="eyebrow muted">SHOP NOW →</p></a>`).join("")}</div>`}

function home(){
 return `<main><section class="hero"><img src="/assets/hero.jpg" alt="Models wearing layered silver chains and rings"><div class="hero-overlay"></div><div class="hero-copy"><p class="eyebrow muted">DROP 04 — SILVER RITUAL</p><h1>WEIGHT YOU<br>CAN FEEL</h1><a class="btn btn-primary" href="/shop">SHOP THE DROP</a></div></section>
 <div class="marquee"><div class="marquee-track">${[0,1].map(()=>`<div>${[...TICKER,...TICKER,...TICKER].map(t=>`<span class="eyebrow marquee-item">${t}</span>`).join("")}</div>`).join("")}</div></div>
 <section class="section"><div class="section-head"><p class="eyebrow muted">NEW ARRIVALS</p><h2>JUST DROPPED</h2></div>${cards(PRODUCTS.slice(0,4))}<div class="view-all"><a class="btn" href="/shop">VIEW ALL PRODUCTS</a></div></section>
 <section class="section" style="border-top:1px solid var(--border)"><div class="section-head"><p class="eyebrow muted">COLLECTIONS</p><h2>SHOP BY CATEGORY</h2></div>${categories()}</section>
 <section class="editorial"><img src="/assets/editorial.jpg" alt="Close-up of layered silver chains"><div class="editorial-overlay"><h2>MADE IN 925</h2><p>Solid sterling silver, anti-tarnish finished and hand-polished in small batches. Once a drop sells out, it never comes back.</p><a class="btn" href="/about">OUR STORY</a></div></section>
 <section class="value-grid"><div class="value"><h3>48 HOUR DISPATCH</h3><p>Every order leaves our studio within two days.</p></div><div class="value"><h3>LIFETIME POLISH</h3><p>Free re-polishing on all 4BITTERZS pieces, forever.</p></div><div class="value"><h3>EASY RETURNS</h3><p>7-day no-questions returns across India.</p></div></section></main>`;
}

function about(){
 return `<main><section class="container about-intro"><p class="eyebrow muted">SINCE 2019</p><h1>SILVER THAT ACTS LIKE ARMOUR</h1><p>4BITTERZS started in a two-bench studio with one rule: nothing hollow. Every chain, ring and cuff is cast in solid 925 sterling silver, filed by hand and polished until it throws light. We drop in small runs, and when a run sells out it does not come back.</p></section><img src="/assets/editorial.jpg" style="width:100%;height:50vh;object-fit:cover" alt="Layered silver chains"><section class="about-values"><div><h2>SOLID, NEVER PLATED</h2><p>925 sterling throughout — no filler, no flash-plating.</p></div><div><h2>SMALL BATCH</h2><p>Runs of 150 pieces or fewer, then the mould is retired.</p></div><div><h2>LIFETIME POLISH</h2><p>Send any 4BITTERZS piece back for free re-polishing, forever.</p></div></section><section class="section center"><h2 style="font-size:48px">WEAR IT EVERY DAY</h2><a class="btn btn-primary" style="margin-top:24px" href="/shop">SHOP THE RANGE</a></section></main>`;
}

function contact(){
    return `
        <main class="container">

            <p class="eyebrow muted">
                WE REPLY IN ONE WORKING DAY
            </p>

            <h1 class="page-title">
                GET IN TOUCH
            </h1>

            <div
                class="form-grid"
                style="margin-top:48px"
            >

                <div id="contactBox">

                    <form id="contactForm">

                        <div class="field">
                            <label
                                class="eyebrow muted"
                                for="name"
                            >
                                NAME
                            </label>

                            <input
                                id="name"
                                required
                            >
                        </div>

                        <div class="field">
                            <label
                                class="eyebrow muted"
                                for="email"
                            >
                                EMAIL
                            </label>

                            <input
                                id="email"
                                type="email"
                                required
                            >
                        </div>

                        <div class="field">
                            <label
                                class="eyebrow muted"
                                for="message"
                            >
                                MESSAGE
                            </label>

                            <textarea
                                id="message"
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        <button
                            class="btn btn-primary"
                            type="submit"
                        >
                            SEND MESSAGE
                        </button>

                    </form>

                    <div
                        class="muted"
                        style="font-size:14px;margin-top:40px;line-height:1.8"
                    >
                        <p>
                            <a href="mailto:${SUPPORT_EMAIL}">
                                ${SUPPORT_EMAIL}
                            </a>
                        </p>

                        <p>
                            Mon–Sat, 10am–7pm IST
                        </p>

                        <p>
                            ${STORE_ADDRESS}
                        </p>

                        <p>
                            <a
                                href="${INSTAGRAM_URL}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Instagram @4bitterzs ↗
                            </a>
                        </p>
                    </div>

                </div>

                <div>

                    <h2 style="font-size:40px">
                        FAQ
                    </h2>

                    <dl class="faq">

                        ${[
                            [
                                "How fast do you ship?",
                                "Orders are prepared for dispatch within 48 hours, Monday to Saturday, excluding public holidays."
                            ],
                            [
                                "Can I return a piece?",
                                "Yes — return requests can be made within 7 days of delivery for eligible unused and unworn items."
                            ],
                            [
                                "How do I find my ring size?",
                                "Use our Size Guide or email support@4bitterzs.com for help with a specific piece."
                            ],
                            [
                                "How should I care for silver?",
                                "Keep it dry, avoid chemicals and store each piece separately. See our Care Guide for more."
                            ]
                        ].map(x => `
                            <div class="faq-item">
                                <dt>${x[0]}</dt>
                                <dd>${x[1]}</dd>
                            </div>
                        `).join("")}

                    </dl>

                </div>

            </div>

        </main>
    `;
}


/* =========================================================
   BRAND HELP / POLICY PAGES
   ========================================================= */

function shippingReturnsPage() {

    return `
        <main class="container info-page">

            <p class="eyebrow muted">HELP / SHIPPING & RETURNS</p>

            <h1 class="page-title">
                SHIPPING & RETURNS
            </h1>

            <div class="info-content">

                <section>
                    <h2>SHIPPING</h2>

                    <p>
                        Orders are prepared for dispatch within 48 hours,
                        Monday to Saturday, excluding public holidays.
                    </p>

                    <p>
                        We currently ship across India. Delivery times can
                        vary by destination and courier conditions.
                    </p>

                    <p>
                        Once your order is dispatched, tracking information
                        can be shared with the email address used at checkout.
                    </p>
                </section>

                <section>
                    <h2>RETURNS</h2>

                    <p>
                        You can request a return within 7 days of delivery.
                        Items should be unused, unworn and returned with their
                        original packaging and pouch.
                    </p>

                    <p>
                        To request a return, email
                        <a href="mailto:${SUPPORT_EMAIL}">
                            ${SUPPORT_EMAIL}
                        </a>
                        with your order number and the reason for the request.
                    </p>

                    <p>
                        Return approval is subject to inspection after the
                        item is received.
                    </p>
                </section>

                <section>
                    <h2>REFUNDS</h2>

                    <p>
                        Approved refunds are processed after the returned item
                        has been received and checked. The time for the amount
                        to appear in your account can depend on the payment
                        provider or bank.
                    </p>
                </section>

                <section>
                    <h2>NEED HELP?</h2>

                    <p>
                        Contact
                        <a href="mailto:${SUPPORT_EMAIL}">
                            ${SUPPORT_EMAIL}
                        </a>
                        and include your order number so we can assist you.
                    </p>

                    <p class="muted">
                        ${STORE_ADDRESS}
                    </p>
                </section>

            </div>

        </main>
    `;
}

function sizeGuidePage() {

    return `
        <main class="container info-page">

            <p class="eyebrow muted">HELP / SIZE GUIDE</p>

            <h1 class="page-title">
                SIZE GUIDE
            </h1>

            <div class="info-content">

                <section>
                    <h2>RING SIZING</h2>

                    <p>
                        Measure the inside circumference of a ring that fits
                        comfortably, or measure around the finger where the
                        ring will be worn. Keep the tape or paper snug, not tight.
                    </p>

                    <div class="table-wrap">
                        <table class="admin-table-v3">
                            <thead>
                                <tr>
                                    <th>INDIA SIZE</th>
                                    <th>INSIDE DIAMETER</th>
                                    <th>APPROX. CIRCUMFERENCE</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>14</td>
                                    <td>17.2 mm</td>
                                    <td>54.0 mm</td>
                                </tr>
                                <tr>
                                    <td>16</td>
                                    <td>17.8 mm</td>
                                    <td>55.9 mm</td>
                                </tr>
                                <tr>
                                    <td>18</td>
                                    <td>18.5 mm</td>
                                    <td>58.1 mm</td>
                                </tr>
                                <tr>
                                    <td>20</td>
                                    <td>19.1 mm</td>
                                    <td>60.0 mm</td>
                                </tr>
                                <tr>
                                    <td>22</td>
                                    <td>19.8 mm</td>
                                    <td>62.2 mm</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2>BETWEEN SIZES?</h2>

                    <p>
                        If your measurement falls between two sizes, contact us
                        before ordering so we can help with the specific piece.
                    </p>

                    <a
                        class="btn btn-primary"
                        href="mailto:${SUPPORT_EMAIL}?subject=4BITTERZS%20Size%20Help"
                    >
                        ASK FOR SIZE HELP
                    </a>
                </section>

            </div>

        </main>
    `;
}

function careGuidePage() {

    return `
        <main class="container info-page">

            <p class="eyebrow muted">HELP / CARE GUIDE</p>

            <h1 class="page-title">
                CARE GUIDE
            </h1>

            <div class="info-content">

                <section>
                    <h2>KEEP IT DRY</h2>

                    <p>
                        Remove your jewellery before showering, swimming or
                        exercising. Avoid prolonged contact with water.
                    </p>
                </section>

                <section>
                    <h2>AVOID CHEMICALS</h2>

                    <p>
                        Perfume, lotions, creams, cleaning products and
                        chlorine can affect the finish of silver. Apply
                        personal-care products first and let them dry before
                        putting your jewellery on.
                    </p>
                </section>

                <section>
                    <h2>STORAGE</h2>

                    <p>
                        Store each piece in a dry pouch or jewellery box when
                        you are not wearing it. Keeping pieces separated helps
                        reduce scratches and tangling.
                    </p>
                </section>

                <section>
                    <h2>CLEANING</h2>

                    <p>
                        Gently wipe your jewellery with a soft jewellery cloth.
                        Do not use abrasive cleaners or rough materials.
                    </p>
                </section>

                <section>
                    <h2>NEED HELP?</h2>

                    <p>
                        For care questions about a specific 4BITTERZS piece,
                        contact
                        <a href="mailto:${SUPPORT_EMAIL}">
                            ${SUPPORT_EMAIL}
                        </a>.
                    </p>
                </section>

            </div>

        </main>
    `;
}


function cartPage(){
 const detailed=cart.map(x=>({...x,product:getProduct(x.slug)})).filter(x=>x.product);
 if(!detailed.length)return `<main class="container"><h1 class="page-title">YOUR CART</h1><div class="empty"><p class="muted">Your cart is empty.</p><a class="btn btn-primary" style="margin-top:24px" href="/shop">SHOP THE DROP</a></div></main>`;
 const subtotal=detailed.reduce((n,x)=>n+x.product.price*x.qty,0);
 return `<main class="container"><h1 class="page-title">YOUR CART</h1><div class="cart-layout"><ul class="cart-list">${detailed.map(x=>`<li class="cart-row"><img src="${x.product.img}" alt="${x.product.name}"><div class="cart-main"><a class="cart-name" href="/product/${x.product.slug}">${x.product.name}</a><p class="cart-meta">Size ${x.size}</p><p style="font-size:14px">${money(x.product.price)}</p><div class="qty"><button data-minus="${x.slug}|${x.size}">−</button><span>${x.qty}</span><button data-plus="${x.slug}|${x.size}">+</button></div><button class="icon-btn muted" style="margin-top:10px" data-remove="${x.slug}|${x.size}" aria-label="Remove item">Remove</button></div><p style="font-size:14px">${money(x.product.price*x.qty)}</p></li>`).join("")}</ul><aside class="summary"><h2>SUMMARY</h2><div class="summary-line"><span class="muted">Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-line"><span class="muted">Shipping</span><span>Free</span></div><div class="summary-line summary-total"><span>Total</span><span>${money(subtotal)}</span></div><button class="btn btn-primary" style="width:100%;margin-top:24px" id="checkout">CHECKOUT</button><a class="btn" style="width:100%;text-align:center;margin-top:12px" href="/shop">CONTINUE SHOPPING</a></aside></div></main>`;
}

function notFound(){return `<main class="container center" style="min-height:55vh;padding-top:100px"><h1 style="font-size:90px">404</h1><h2 style="font-family:Barlow;font-size:20px">Page not found</h2><p class="muted">The page you're looking for doesn't exist or has been moved.</p><a class="btn btn-primary" style="margin-top:24px" href="/">GO HOME</a></main>`}

function showToast(message) {
    document.querySelector(".toast")?.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
}

function searchPanel() {
    return `
        <div class="search-panel" id="searchPanel">

            <button class="search-close" id="searchClose" aria-label="Close search">
                ×
            </button>

            <div class="search-panel-inner">

                <p class="eyebrow muted">SEARCH 4BITTERZS</p>

                <div class="search-input-wrap">
                    ${icon("search")}

                    <input
                        id="searchInput"
                        class="search-input"
                        type="search"
                        placeholder="SEARCH PRODUCTS..."
                        autocomplete="off"
                    >
                </div>

                <div id="searchResults" class="search-results">
                    ${searchResultHTML(PRODUCTS)}
                </div>

            </div>
        </div>
    `;
}

function searchResultHTML(list) {
    if (!list.length) {
        return `<p class="search-empty">No products found.</p>`;
    }

    return cards(list);
}

function openSearch() {
    let panel = document.querySelector("#searchPanel");

    if (!panel) {
        document.body.insertAdjacentHTML("beforeend", searchPanel());
        panel = document.querySelector("#searchPanel");
    }

    panel.classList.add("open");

    const input = document.querySelector("#searchInput");

    setTimeout(() => input?.focus(), 50);

    document.querySelector("#searchClose")?.addEventListener("click", closeSearch);

    input?.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();

        const results = PRODUCTS.filter(product => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.material.toLowerCase().includes(query)
            );
        });

        document.querySelector("#searchResults").innerHTML =
            searchResultHTML(results);

        bindInternalLinks();
    });
}

function closeSearch() {
    document.querySelector("#searchPanel")?.classList.remove("open");
}

function adminForm(product = null) {
    const editing = !!product;

    return `
        <main class="container">

            <p class="eyebrow muted">
                ADMIN / ${editing ? "EDIT" : "NEW"}
            </p>

            <h1 class="page-title">
                ${editing ? "EDIT PRODUCT" : "ADD PRODUCT"}
            </h1>

            <form class="admin-form" id="productAdminForm" style="margin-top:36px">

                <input
                    type="hidden"
                    id="adminProductSlug"
                    value="${product?.slug || ""}"
                >

                <div class="admin-form-grid">

                    <div class="field">
                        <label class="eyebrow muted">NAME</label>
                        <input
                            id="adminProductName"
                            value="${product?.name || ""}"
                            required
                        >
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">CATEGORY</label>

                        <select
                            id="adminProductCategory"
                            style="width:100%;margin-top:8px;background:var(--bg);border:1px solid var(--border);padding:12px 16px"
                        >
                            ${CATEGORIES.map(c => `
                                <option
                                    value="${c.slug}"
                                    ${product?.category === c.slug ? "selected" : ""}
                                >
                                    ${c.label}
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">PRICE</label>
                        <input
                            id="adminProductPrice"
                            type="number"
                            value="${product?.basePrice ?? product?.price ?? ""}"
                            required
                        >
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">MRP</label>
                        <input
                            id="adminProductMrp"
                            type="number"
                            value="${product?.mrp || ""}"
                            required
                        >
                    </div>

                    <div class="field full">
                        <label class="eyebrow muted">IMAGE PATH</label>
                        <input
                            id="adminProductImage"
                            value="${product?.img || "/assets/p1.jpg"}"
                            required
                        >
                    </div>

                    <div class="field full">
                        <label class="eyebrow muted">DESCRIPTION</label>
                        <textarea
                            id="adminProductDescription"
                            rows="5"
                            required
                        >${product?.description || ""}</textarea>
                    </div>

                </div>

                <button class="btn btn-primary">
                    ${editing ? "SAVE CHANGES" : "ADD PRODUCT"}
                </button>

                <a
                    class="btn"
                    style="margin-left:8px"
                    href="/admin"
                >
                    CANCEL
                </a>

            </form>

        </main>
    `;
}

function demoStock(slug) {
    /*
        Deterministic demo stock.
        This is intentionally NOT real inventory.
    */

    const product = getProduct(slug);

    if (!product) return 0;

    return 3 + (
        product.slug.length * 7
    ) % 15;
}

function adminDashboard() {
    const lowStock = PRODUCTS.filter(p => demoStock(p.slug) <= 5).length;
    const customers = [...new Set(demoOrders.map(o => o.userEmail).filter(Boolean))];
    const revenue = demoOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    return adminShell("dashboard", `
        <div class="admin-page-head">
            <div>
                <p class="eyebrow muted">OVERVIEW</p>
                <h1>DASHBOARD</h1>
            </div>
            <a class="btn btn-primary" href="/admin/add">+ ADD PRODUCT</a>
        </div>

        <div class="admin-metric-grid">
            <div class="admin-metric"><span class="eyebrow muted">PRODUCTS</span><strong>${PRODUCTS.length}</strong></div>
            <div class="admin-metric"><span class="eyebrow muted">ORDERS</span><strong>${demoOrders.length}</strong></div>
            <div class="admin-metric"><span class="eyebrow muted">CUSTOMERS</span><strong>${customers.length}</strong></div>
            <div class="admin-metric"><span class="eyebrow muted">REVENUE</span><strong>${money(revenue)}</strong></div>
        </div>

        <div class="admin-panel">
            <h2>ATTENTION</h2>
            <p class="muted" style="line-height:1.7">
                ${lowStock} product${lowStock === 1 ? "" : "s"} currently showing low demo stock.
                ${demoOrders.length ? `${demoOrders.length} customer order${demoOrders.length === 1 ? "" : "s"} require management.` : "No customer orders yet."}
            </p>
            <div class="admin-action-row" style="margin-top:16px">
                <a class="admin-action" href="/admin/products">MANAGE PRODUCTS</a>
                <a class="admin-action" href="/admin/orders">MANAGE ORDERS</a>
                <a class="admin-action" href="/admin/promotions">PROMOTIONS</a>
            </div>
        </div>

        <div class="admin-panel">
            <h2>RECENT ORDERS</h2>
            ${demoOrders.length ? `
                <div style="overflow-x:auto">
                    <table class="admin-table-v3">
                        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th>TOTAL</th></tr></thead>
                        <tbody>
                            ${demoOrders.slice(0,5).map(o => `
                                <tr>
                                    <td><a href="/admin/orders/${o.id}">#${o.id}</a></td>
                                    <td>${o.customerName || o.userEmail || "Guest"}</td>
                                    <td>${new Date(o.date).toLocaleDateString("en-IN")}</td>
                                    <td><span class="admin-status">${o.status}</span></td>
                                    <td>${money(o.total)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="admin-empty"><p class="muted">No customer orders yet.</p></div>`}
        </div>
    `);
}

function adminProducts() {
    return adminShell("products", `
        <div class="admin-page-head">
            <div><p class="eyebrow muted">CATALOG</p><h1>PRODUCTS</h1></div>
            <a class="btn btn-primary" href="/admin/add">+ ADD PRODUCT</a>
        </div>

        <div class="admin-panel">
            <div style="overflow-x:auto">
                <table class="admin-table-v3">
                    <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>ACTIONS</th></tr></thead>
                    <tbody>
                        ${PRODUCTS.map(p => `
                            <tr>
                                <td><div class="admin-product"><img src="${p.img}" alt="${p.name}"><span>${p.name}</span></div></td>
                                <td>${p.category}</td>
                                <td>${money(p.price)}</td>
                                <td>${demoStock(p.slug)}</td>
                                <td><div class="admin-action-row"><a class="admin-action" href="/admin/edit/${p.slug}">EDIT</a><button class="admin-action" data-v3-delete-product="${p.slug}">DELETE</button></div></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

function adminOrders() {
    return adminShell("orders", `
        <div class="admin-page-head">
            <div><p class="eyebrow muted">CUSTOMER ORDERS</p><h1>ORDERS</h1></div>
        </div>

        <div class="admin-panel">
            ${demoOrders.length ? `
                <div style="overflow-x:auto">
                    <table class="admin-table-v3">
                        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th>TOTAL</th><th></th></tr></thead>
                        <tbody>
                            ${demoOrders.map(o => `
                                <tr>
                                    <td><strong>#${o.id}</strong></td>
                                    <td><div>${o.customerName || "Customer"}</div><span class="muted">${o.userEmail || "Guest"}</span></td>
                                    <td>${new Date(o.date).toLocaleDateString("en-IN")}</td>
                                    <td>
                                        <select class="admin-status-select" data-order-status="${o.id}">
                                            ${["Processing","Packed","Shipped","Delivered","Cancelled"].map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
                                        </select>
                                    </td>
                                    <td>${money(o.total)}</td>
                                    <td><a class="admin-action" href="/admin/orders/${o.id}">VIEW</a></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="admin-empty"><p class="muted">No customer orders yet.</p></div>`}
        </div>
    `);
}

function adminOrderDetail(order) {
    if (!order) return adminShell("orders", `<div class="admin-empty"><p class="muted">Order not found.</p></div>`);

    return adminShell("orders", `
        <div class="admin-page-head">
            <div><p class="eyebrow muted">CUSTOMER ORDER</p><h1>#${order.id}</h1></div>
            <a class="btn" href="/admin/orders">BACK TO ORDERS</a>
        </div>

        <div class="order-detail-layout">
            <section>
                <div class="admin-panel">
                    <h2>ORDER ITEMS</h2>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.name}">
                                <div style="flex:1"><strong>${item.name}</strong><p class="muted">Size ${item.size} · Qty ${item.qty}</p></div>
                                <strong>${money(item.price * item.qty)}</strong>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </section>
            <aside>
                <div class="admin-panel">
                    <h2>ORDER INFO</h2>
                    <div class="summary-line"><span class="muted">Customer</span><span>${order.customerName || "Guest"}</span></div>
                    <div class="summary-line"><span class="muted">Email</span><span>${order.userEmail || "Guest"}</span></div>
                    <div class="summary-line"><span class="muted">Status</span><span>${order.status}</span></div>
                    <div class="summary-line"><span class="muted">Total</span><strong>${money(order.total)}</strong></div>
                </div>
                <div class="admin-panel">
                    <h2>SHIPPING</h2>
                    <p style="line-height:1.7">${order.shipping?.name || "—"}<br>${order.shipping?.phone || "—"}<br>${order.shipping?.address || "—"}<br>${order.shipping?.city || ""} ${order.shipping?.pincode || ""}</p>
                </div>
            </aside>
        </div>
    `);
}

function adminCustomers() {
    const byEmail = {};
    try {
        const registered = JSON.parse(localStorage.getItem("aurvm-users") || "[]");
        registered.forEach(user => {
            if (user.email) byEmail[user.email] = { email: user.email, name: user.name || "Customer", orders: 0, spent: 0 };
        });
    } catch (error) {}

    demoOrders.forEach(order => {
        const email = order.userEmail || "guest";
        if (!byEmail[email]) byEmail[email] = { email, name: order.customerName || "Guest", orders: 0, spent: 0 };
        byEmail[email].orders += 1;
        byEmail[email].spent += Number(order.total || 0);
    });

    const customers = Object.values(byEmail);

    return adminShell("customers", `
        <div class="admin-page-head"><div><p class="eyebrow muted">CUSTOMER MANAGEMENT</p><h1>CUSTOMERS</h1></div></div>
        <div class="admin-panel">
            ${customers.length ? `
                <div style="overflow-x:auto">
                    <table class="admin-table-v3">
                        <thead><tr><th>NAME</th><th>EMAIL</th><th>ORDERS</th><th>SPENT</th></tr></thead>
                        <tbody>${customers.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.orders}</td><td>${money(c.spent)}</td></tr>`).join("")}</tbody>
                    </table>
                </div>
            ` : `<div class="admin-empty"><p class="muted">Customer data will appear after orders are placed.</p></div>`}
        </div>
    `);
}

function adminPromotions() {
    const activeDiscounted = PRODUCTS.filter(p => productSaleDiscount(p) > 0).length;

    return adminShell("promotions", `
        <div class="admin-page-head">
            <div>
                <p class="eyebrow muted">SALES / COUPONS</p>
                <h1>PROMOTIONS</h1>
            </div>
            <a class="btn" href="/sale">VIEW SALE PAGE</a>
        </div>

        <div class="admin-panel promotion-panel">
            <div class="promotion-head">
                <div>
                    <p class="eyebrow muted">SALE BUILDER</p>
                    <h2>RUN A SALE</h2>
                    <p class="muted">Apply a percentage discount sitewide, to one category, or to selected products.</p>
                </div>
                <span class="admin-status">${saleIsActive() ? `${activeDiscounted} PRODUCTS ON SALE` : "SALE INACTIVE"}</span>
            </div>

            <form id="saleAdminForm" class="promotion-form">
                <label class="toggle-row">
                    <input id="saleEnabled" type="checkbox" ${saleConfig.enabled ? "checked" : ""}>
                    <span>SALE ACTIVE</span>
                </label>

                <div class="admin-form-grid">
                    <div class="field">
                        <label class="eyebrow muted">SALE TITLE</label>
                        <input id="saleTitle" value="${saleConfig.title || "FESTIVE SILVER SALE"}" required>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">DISCOUNT %</label>
                        <input id="saleDiscount" type="number" min="1" max="90" value="${saleConfig.discount || 20}" required>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">SCOPE</label>
                        <select id="saleScope" class="admin-select">
                            <option value="sitewide" ${saleConfig.scope === "sitewide" ? "selected" : ""}>SITEWIDE</option>
                            <option value="category" ${saleConfig.scope === "category" ? "selected" : ""}>CATEGORY</option>
                            <option value="products" ${saleConfig.scope === "products" ? "selected" : ""}>SELECT PRODUCTS</option>
                        </select>
                    </div>

                    <div class="field" id="saleCategoryWrap" style="${saleConfig.scope === "category" ? "" : "display:none"}">
                        <label class="eyebrow muted">CATEGORY</label>
                        <select id="saleCategory" class="admin-select">
                            ${CATEGORIES.map(c => `<option value="${c.slug}" ${saleConfig.category === c.slug ? "selected" : ""}>${c.label}</option>`).join("")}
                        </select>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">START DATE (OPTIONAL)</label>
                        <input id="saleStart" type="datetime-local" value="${saleConfig.startDate || ""}">
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">END DATE (OPTIONAL)</label>
                        <input id="saleEnd" type="datetime-local" value="${saleConfig.endDate || ""}">
                    </div>
                </div>

                <div id="saleProductsWrap" class="sale-product-picker" style="${saleConfig.scope === "products" ? "" : "display:none"}">
                    <div class="promotion-head">
                        <div>
                            <p class="eyebrow muted">PRODUCTS</p>
                            <h3>CHOOSE PRODUCTS</h3>
                        </div>
                        <span class="muted">${saleConfig.productSlugs.length} selected</span>
                    </div>
                    <div class="sale-product-grid">
                        ${PRODUCTS.map(product => `
                            <label class="sale-product-option">
                                <input
                                    type="checkbox"
                                    name="saleProduct"
                                    value="${product.slug}"
                                    ${saleConfig.productSlugs.includes(product.slug) ? "checked" : ""}
                                >
                                <img src="${product.img}" alt="${product.name}">
                                <span>
                                    <strong>${product.name}</strong>
                                    <small>${product.category} · ${money(product.basePrice || product.price)}</small>
                                </span>
                            </label>
                        `).join("")}
                    </div>
                </div>

                <div class="admin-action-row" style="margin-top:22px">
                    <button class="btn btn-primary" type="submit">SAVE SALE</button>
                    <button class="admin-action" type="button" id="disableSale">TURN SALE OFF</button>
                </div>
            </form>
        </div>

        <div class="admin-panel promotion-panel">
            <div class="promotion-head">
                <div>
                    <p class="eyebrow muted">COUPON MANAGER</p>
                    <h2>CREATE COUPON</h2>
                    <p class="muted">Create percentage or fixed-amount codes with optional minimum order and expiry.</p>
                </div>
            </div>

            <form id="couponAdminForm" class="promotion-form">
                <div class="admin-form-grid">
                    <div class="field">
                        <label class="eyebrow muted">CODE</label>
                        <input id="couponCode" placeholder="WELCOME10" required maxlength="30">
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">TYPE</label>
                        <select id="couponType" class="admin-select">
                            <option value="percent">PERCENTAGE</option>
                            <option value="fixed">FIXED AMOUNT</option>
                        </select>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">VALUE</label>
                        <input id="couponValue" type="number" min="1" required>
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">MINIMUM ORDER</label>
                        <input id="couponMinOrder" type="number" min="0" value="0">
                    </div>

                    <div class="field">
                        <label class="eyebrow muted">EXPIRY (OPTIONAL)</label>
                        <input id="couponExpiry" type="datetime-local">
                    </div>
                </div>

                <label class="toggle-row">
                    <input id="couponActive" type="checkbox" checked>
                    <span>ACTIVE</span>
                </label>

                <button class="btn btn-primary" type="submit">CREATE COUPON</button>
            </form>
        </div>

        <div class="admin-panel promotion-panel">
            <div class="promotion-head">
                <div>
                    <p class="eyebrow muted">EXISTING CODES</p>
                    <h2>COUPONS</h2>
                </div>
            </div>

            ${coupons.length ? `
                <div style="overflow-x:auto">
                    <table class="admin-table-v3">
                        <thead>
                            <tr><th>CODE</th><th>DISCOUNT</th><th>MIN ORDER</th><th>EXPIRY</th><th>STATUS</th><th></th></tr>
                        </thead>
                        <tbody>
                            ${coupons.map(coupon => `
                                <tr>
                                    <td><strong>${coupon.code}</strong></td>
                                    <td>${coupon.type === "fixed" ? money(coupon.value) : `${coupon.value}%`}</td>
                                    <td>${Number(coupon.minOrder || 0) ? money(coupon.minOrder) : "—"}</td>
                                    <td>${coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString("en-IN") : "No expiry"}</td>
                                    <td><span class="admin-status">${coupon.active === false ? "Inactive" : "Active"}</span></td>
                                    <td>
                                        <div class="admin-action-row">
                                            <button class="admin-action" type="button" data-coupon-toggle="${coupon.code}">${coupon.active === false ? "ACTIVATE" : "DISABLE"}</button>
                                            <button class="admin-action" type="button" data-coupon-delete="${coupon.code}">DELETE</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="admin-empty"><p class="muted">No coupons created yet.</p></div>`}
        </div>
    `);
}

function adminSettings() {
    return adminShell("settings", `
        <div class="admin-page-head"><div><p class="eyebrow muted">STORE CONFIGURATION</p><h1>SETTINGS</h1></div></div>
        <div class="admin-panel">
            <h2>STORE</h2>
            <p class="muted" style="line-height:1.7">Frontend prototype settings. Real store configuration, staff accounts, tax, shipping rules and payment credentials will be connected securely in the backend phase.</p>
        </div>
        <div class="admin-panel">
            <h2>DEMO DATA</h2>
            <button class="admin-action" id="clearDemoOrders">CLEAR DEMO ORDERS</button>
        </div>
    `);
}

function adminProductFormPage(product = null) {
    return adminShell("products", `
        <div class="admin-page-head">
            <div><p class="eyebrow muted">CATALOG</p><h1>${product ? "EDIT PRODUCT" : "ADD PRODUCT"}</h1></div>
            <a class="btn" href="/admin/products">BACK TO PRODUCTS</a>
        </div>
        ${adminForm(product)}
    `);
}


/* Compatibility helpers used by the admin view templates. */
function saveDemoProducts() {
    localStorage.setItem("aurvm-products", JSON.stringify(PRODUCTS));
}
