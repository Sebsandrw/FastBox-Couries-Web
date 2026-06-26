/* FastBox Courier - Interacciones del prototipo.
   No requiere servidor: usa localStorage como simulación de base de datos. */
(function () {
  "use strict";

  const F = window.FastBoxData;
  if (!F) return;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Detecta si la pantalla está dentro de la carpeta pages.
  const inPagesFolder = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
  const currentFile = () => (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const pageLink = (file) => inPagesFolder ? file : `pages/${file}`;
  const homeLink = () => inPagesFolder ? "../index.html" : "index.html";
  const assetLink = (file) => inPagesFolder ? `../assets/${file}` : `assets/${file}`;

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));

  function navLink(file, label, options = {}) {
    const active = currentFile() === file ? "active" : "";
    const url = file === "index.html" ? homeLink() : pageLink(file);
    return `<a class="${active}" href="${url}">${options.icon ? `<span>${options.icon}</span> ` : ""}${label}</a>`;
  }

  function renderShell() {
    const header = $("#siteHeader");
    const footer = $("#siteFooter");
    const session = F.getSession();
    const loginLabel = session ? `Panel de ${session.role === "admin" ? "admin" : "cliente"}` : "Ingresar";
    const loginTarget = session ? pageLink(session.role === "admin" ? "panel-admin.html" : "panel-cliente.html") : pageLink("login.html");

    if (header) {
      header.innerHTML = `
        <header class="site-header">
          <div class="container navbar">
            <a class="brand" href="${homeLink()}" aria-label="Inicio FastBox Courier"><img src="${assetLink("img/fastbox-logo.svg")}" alt="FastBox Courier"></a>
            <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">☰</button>
            <nav class="main-nav" id="mainNav" aria-label="Menú principal">
              ${navLink("index.html", "Inicio")}
              ${navLink("registrar-paquete.html", "Prealerta")}
              ${navLink("rastreo.html", "Rastreo")}
              ${navLink("tarifas.html", "Tarifas")}
              ${navLink("catalogo.html", "Catálogo")}
              ${navLink("planes.html", "Planes")}
              ${navLink("contacto.html", "Contacto")}
              ${navLink("bitacora.html", "Bitácora")}
            </nav>
            <div class="nav-actions">
              <button type="button" class="icon-button" id="openCart" aria-label="Abrir carrito de pedidos">🛒<span class="cart-count" id="cartCount">0</span></button>
              <a class="nav-login ${session ? "logged" : ""}" href="${loginTarget}">${loginLabel}</a>
            </div>
          </div>
        </header>`;
    }

    if (footer) {
      footer.innerHTML = `
        <footer class="site-footer">
          <div class="container footer-top">
            <div>
              <a href="${homeLink()}" class="footer-brand"><img src="${assetLink("img/fastbox-logo.svg")}" alt="FastBox Courier"></a>
              <p>FastBox Courier es una propuesta académica de casillero internacional. El prototipo simula el registro, cobro por peso, rastreo y atención al cliente.</p>
            </div>
            <div>
              <h3>Accesos rápidos</h3>
              <ul>
                <li><a href="${pageLink("registrar-paquete.html")}">Registrar una compra</a></li>
                <li><a href="${pageLink("rastreo.html")}">Rastrear una guía</a></li>
                <li><a href="${pageLink("tarifas.html")}">Calcular un envío</a></li>
                <li><a href="${pageLink("planes.html")}">Planes de ahorro</a></li>
              </ul>
            </div>
            <div>
              <h3>Soporte FastBox</h3>
              <p>Guayaquil, Ecuador<br>soporte@fastbox.demo<br>+593 99 123 4567</p>
              <p style="margin-top:10px">Horario simulado: lunes a viernes, 09:00–18:00.</p>
            </div>
          </div>
          <div class="footer-bottom">© ${new Date().getFullYear()} FastBox Courier · Proyecto de Escobar Bailón Sebastian Andrey · Prototipo académico.</div>
        </footer>`;
    }

    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal-backdrop" id="globalModal" aria-hidden="true"></div>
      <div class="toast" id="toastMessage" role="status"></div>
    `);

    const toggle = $("#navToggle");
    const nav = $("#mainNav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "×" : "☰";
      });
    }
    $("#openCart")?.addEventListener("click", openCartModal);
    updateCartCount();
  }

  // Registra una acción en la nueva página de bitácora.
  function logActivity(action, description) {
    F.addActivity(action, description);
  }

  function showToast(message, type = "success") {
    const toast = $("#toastMessage");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.className = "toast"; }, 3800);
  }

  function openModal(title, subtitle, body, onOpen) {
    const backdrop = $("#globalModal");
    if (!backdrop) return;
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <div><h2 id="modalTitle">${title}</h2><p>${subtitle || ""}</p></div>
          <button class="close-modal" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="modal-body">${body}</div>
      </div>`;
    backdrop.classList.add("show");
    document.body.classList.add("modal-open");
    const close = () => closeModal();
    $(".close-modal", backdrop).addEventListener("click", close);
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); }, { once: true });
    onOpen?.(backdrop);
  }
  function closeModal() {
    const backdrop = $("#globalModal");
    if (!backdrop) return;
    backdrop.classList.remove("show");
    backdrop.innerHTML = "";
    document.body.classList.remove("modal-open");
  }

  function cartTotal() {
    return F.getCart().reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  }
  function updateCartCount() {
    const count = F.getCart().reduce((sum, item) => sum + Number(item.quantity), 0);
    const badge = $("#cartCount");
    if (badge) badge.textContent = count;
  }
  function addToCart(productId) {
    const product = F.PRODUCTS.find((item) => item.id === productId);
    if (!product || product.stock < 1) {
      showToast("Este producto no tiene stock por el momento.", "error");
      return;
    }
    const cart = F.getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast("Ya agregaste la cantidad disponible de este producto.", "error");
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, title: product.title, category: product.category, weight: product.weight, price: product.price, icon: product.icon, quantity: 1 });
    }
    F.saveCart(cart);
    logActivity("Producto agregado al carrito", `${product.title} fue agregado al carrito de prealertas.`);
    updateCartCount();
    showToast(`${product.title} se agregó al carrito de prealertas.`);
  }
  function removeFromCart(productId) {
    F.saveCart(F.getCart().filter((item) => item.id !== productId));
    updateCartCount();
    openCartModal();
  }
  function openCartModal() {
    const cart = F.getCart();
    const content = cart.length ? `
      <div class="cart-list">
        ${cart.map((item) => `<div class="cart-item">
          <div class="cart-item-icon">${escapeHTML(item.icon)}</div>
          <div><strong>${escapeHTML(item.title)}</strong><span>${item.quantity} unidad(es) · ${Number(item.weight * item.quantity).toFixed(1)} lb estimadas</span></div>
          <div style="text-align:right"><strong>${F.formatMoney(item.price * item.quantity)}</strong><button type="button" class="remove-cart" data-remove-cart="${item.id}">Quitar</button></div>
        </div>`).join("")}
      </div>
      <div class="cart-total"><span>Subtotal de productos</span><strong>${F.formatMoney(cartTotal())}</strong></div>
      <p class="form-help">El flete se calcula con el peso estimado cuando conviertas esta compra en una prealerta.</p>
      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px"><button type="button" class="btn btn-outline btn-sm" id="emptyCart">Vaciar</button><a class="btn btn-primary btn-sm" href="${pageLink("registrar-paquete.html")}?cart=1">Registrar pedido</a></div>` : `
      <div class="empty-state"><div style="font-size:2rem">🛒</div><b>Tu carrito está vacío.</b><p>Explora el catálogo para agregar productos de ejemplo.</p><a class="btn btn-primary btn-sm" href="${pageLink("catalogo.html")}">Ir al catálogo</a></div>`;
    openModal("Carrito de prealertas", "Productos seleccionados para tu próxima compra internacional.", content, (backdrop) => {
      $$('[data-remove-cart]', backdrop).forEach((button) => button.addEventListener("click", () => removeFromCart(button.dataset.removeCart)));
      $("#emptyCart", backdrop)?.addEventListener("click", () => { F.saveCart([]); updateCartCount(); openCartModal(); });
    });
  }

  function categoryVisual(category) {
    return category === "tecnologia" ? "tech" : category === "ropa" ? "clothes" : category === "accesorios" ? "accessories" : "";
  }
  function productCard(product) {
    const discounted = product.regularPrice > product.price;
    return `<article class="product-card">
      <div class="product-visual ${categoryVisual(product.category)}">${escapeHTML(product.icon)}</div>
      <div class="product-content">
        <div class="product-meta"><span>${escapeHTML(F.CATEGORIES[product.category].label)}</span>${discounted ? `<span class="discount-label">-${Math.round((1 - product.price / product.regularPrice) * 100)}%</span>` : ""}</div>
        <h3>${escapeHTML(product.title)}</h3>
        <p>${escapeHTML(product.description)}</p>
        <div class="product-bottom">
          <div class="product-price"><strong>${F.formatMoney(product.price)}</strong><span>${Number(product.weight).toFixed(1)} lb estimadas · <b class="${product.stock ? "stock-ok" : "stock-out"}">${product.stock ? `${product.stock} en stock` : "Sin stock"}</b></span></div>
          <button type="button" class="btn ${product.stock ? "btn-dark" : "btn-outline"} btn-sm" data-add-product="${product.id}" ${product.stock ? "" : "disabled"}>${product.stock ? "Agregar" : "Sin stock"}</button>
        </div>
      </div>
    </article>`;
  }
  function initCatalog() {
    const grid = $("#catalogGrid");
    if (!grid) return;
    let active = "all";
    const paint = () => {
      const products = active === "all" ? F.PRODUCTS : F.PRODUCTS.filter((product) => product.category === active);
      grid.innerHTML = products.map(productCard).join("");
      $$('[data-add-product]', grid).forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.addProduct)));
    };
    $$('[data-filter]').forEach((button) => button.addEventListener("click", () => {
      active = button.dataset.filter;
      $$('[data-filter]').forEach((item) => item.classList.toggle("active", item === button));
      paint();
    }));
    paint();
  }

  function statusClass(status) {
    return {
      "Prealerta registrada": "status-prealerta",
      "Recibido en Miami": "status-miami",
      "En tránsito a Ecuador": "status-transito",
      "En aduana": "status-aduana",
      "Listo para entrega": "status-listo",
      "Entregado": "status-entregado"
    }[status] || "status-prealerta";
  }
  function statusBadge(status) { return `<span class="status-badge ${statusClass(status)}">● ${escapeHTML(status)}</span>`; }
  function trackingTimeline(pkg) {
    const statuses = F.STATUS_ORDER;
    const currentIndex = Math.max(0, statuses.indexOf(pkg.status));
    const known = Array.isArray(pkg.history) ? pkg.history : [];
    return statuses.map((status, index) => {
      const event = known.find((item) => item.status === status);
      const done = index <= currentIndex;
      const current = index === currentIndex;
      const detail = event?.detail || (done ? "Actualización registrada en el sistema." : "Pendiente de actualización.");
      const date = event?.at ? F.formatDate(event.at) : (done ? F.formatDate(pkg.updatedAt) : "Pendiente");
      return `<div class="timeline-item ${done ? "done" : ""} ${current ? "current" : ""}">
          <div class="timeline-dot"></div>
          <div><div class="timeline-title">${escapeHTML(status)}</div><div class="timeline-detail">${escapeHTML(detail)}</div></div>
          <div class="timeline-date">${date}</div>
        </div>`;
    }).join("");
  }
  function renderTracking(pkg, target) {
    if (!pkg) {
      target.innerHTML = `<div class="result-card text-center"><div style="font-size:2rem">🔎</div><h2>No encontramos esa guía</h2><p class="text-muted">Revisa el formato. Puedes probar con <b>FBX-123456</b>, <b>FBX-987654</b> o registrar una compra nueva.</p><a class="btn btn-primary btn-sm" href="${pageLink("registrar-paquete.html")}">Registrar prealerta</a></div>`;
      return;
    }
    target.innerHTML = `<div class="result-card">
      <div class="result-header">
        <div><div class="guide-code">${escapeHTML(pkg.guide)}</div><h2>${escapeHTML(pkg.description)}</h2><p class="text-muted" style="margin:0;font-size:.78rem">Origen: ${escapeHTML(pkg.store)} · Peso: ${Number(pkg.weight).toFixed(1)} lb · Tracking original: ${escapeHTML(pkg.originalTracking)}</p></div>
        ${statusBadge(pkg.status)}
      </div>
      <div class="timeline">${trackingTimeline(pkg)}</div>
    </div>`;
  }
  function lookupGuide(guide, target) {
    const normalized = String(guide || "").trim().toUpperCase();
    const pkg = F.getPackages().find((item) => item.guide.toUpperCase() === normalized);
    renderTracking(pkg, target);
  }
  function initTracking() {
    const forms = [$("#trackingForm"), $("#homeTrackingForm")].filter(Boolean);
    forms.forEach((form) => form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("input[name='guide']", form);
      const target = form.id === "homeTrackingForm" ? $("#homeTrackingResult") : $("#trackingResult");
      if (!input.value.trim()) { showToast("Ingresa una guía FastBox para continuar.", "error"); input.focus(); return; }
      lookupGuide(input.value, target);
      logActivity("Búsqueda de guía", `Se consultó la guía ${input.value.trim().toUpperCase()}.`);
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
    const example = new URLSearchParams(window.location.search).get("guia");
    if (example && $("#trackingResult")) {
      $("#trackingGuide").value = example;
      lookupGuide(example, $("#trackingResult"));
    }
  }

  function fillCartInRegistration() {
    const form = $("#packageForm");
    if (!form || new URLSearchParams(window.location.search).get("cart") !== "1") return;
    const cart = F.getCart();
    if (!cart.length) return;
    $("#packageDescription").value = cart.map((item) => `${item.quantity}x ${item.title}`).join(", ");
    $("#packageWeight").value = cart.reduce((sum, item) => sum + item.weight * item.quantity, 0).toFixed(1);
    $("#declaredValue").value = cartTotal().toFixed(2);
    const commonCategory = cart.every((item) => item.category === cart[0].category) ? cart[0].category : "general";
    $("#packageCategory").value = commonCategory;
    $("#cartNotice").classList.remove("hidden");
  }
  function initPackageRegistration() {
    const form = $("#packageForm");
    if (!form) return;
    const session = F.getSession();
    const user = F.getUsers().find((item) => item.email === session?.email);
    if (user) {
      $("#recipientName").value = user.name;
      $("#recipientName").placeholder = user.name;
    }
    fillCartInRegistration();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (Number(data.weight) <= 0) { showToast("El peso estimado debe ser mayor a 0 libras.", "error"); return; }
      const pkg = F.buildPackage({
        ownerEmail: session?.role === "client" ? session.email : "cliente@fastbox.com",
        recipient: data.recipient,
        store: data.store,
        description: data.description,
        originalTracking: data.originalTracking,
        category: data.category,
        weight: data.weight,
        declaredValue: data.declaredValue,
        insured: data.insured === "on"
      });
      const packages = F.getPackages();
      packages.unshift(pkg);
      F.savePackages(packages);
      logActivity("Prealerta registrada", `Se creó la guía ${pkg.guide} para ${pkg.description}.`);
      if (new URLSearchParams(window.location.search).get("cart") === "1") { F.saveCart([]); updateCartCount(); }
      const result = $("#registrationResult");
      result.innerHTML = `<div class="result-card"><div class="guide-code">✓ Prealerta registrada</div><h2>Tu guía local es ${escapeHTML(pkg.guide)}</h2><p class="text-muted">El paquete quedó asociado a <b>${escapeHTML(pkg.recipient)}</b>. El costo estimado de flete es <b>${F.formatMoney(pkg.shipping)}</b> y se ajustará cuando la bodega verifique el peso real.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:17px"><a class="btn btn-primary btn-sm" href="${pageLink("rastreo.html")}?guia=${pkg.guide}">Rastrear pedido</a><a class="btn btn-outline btn-sm" href="${pageLink("panel-cliente.html")}">Ver mi casillero</a></div></div>`;
      result.scrollIntoView({ behavior: "smooth", block: "center" });
      form.reset();
      if (user) $("#recipientName").value = user.name;
      showToast(`Pedido recibido. Guarda la guía ${pkg.guide}.`);
    });
  }

  function updateCalculator() {
    const weight = Number($("#calcWeight")?.value || 0);
    const category = $("#calcCategory")?.value || "general";
    const value = Number($("#calcValue")?.value || 0);
    const insured = Boolean($("#calcInsurance")?.checked);
    const result = F.calculateShipping(weight, category, value, insured);
    $("#calcRate").textContent = F.formatMoney(result.rate);
    $("#calcBase").textContent = F.formatMoney(result.base);
    $("#calcInsuranceCost").textContent = F.formatMoney(result.insurance);
    $("#calcDiscount").textContent = result.discount ? `- ${F.formatMoney(result.discount)}` : F.formatMoney(0);
    $("#calcTotal").textContent = F.formatMoney(result.total);
    const plan = $("#calcPlan");
    if (plan) plan.textContent = result.membership ? `${result.membership.name}: ${Math.round(result.membership.discount * 100)}% de descuento aplicado.` : "Sin plan activo. Puedes revisar los planes de ahorro.";
  }
  function initCalculator() {
    const calc = $("#rateCalculator");
    if (!calc) return;
    ["#calcWeight", "#calcCategory", "#calcValue", "#calcInsurance"].forEach((selector) => $(selector)?.addEventListener("input", updateCalculator));
    $("#calcCategory")?.addEventListener("change", updateCalculator);
    calc.addEventListener("submit", (event) => {
      event.preventDefault();
      if (Number($("#calcWeight").value) <= 0) { showToast("Ingresa un peso mayor a cero para calcular el flete.", "error"); return; }
      showToast("Estimación actualizada. El valor final se confirma al recibir el paquete.");
    });
    updateCalculator();
  }

  const planData = {
    basico: { name: "Plan Básico", monthly: 3.99, yearly: 39.99, discount: .05 },
    plus: { name: "Plan Plus", monthly: 7.99, yearly: 79.99, discount: .10 },
    pro: { name: "Plan Pro", monthly: 12.99, yearly: 129.99, discount: .15 }
  };
  function initPlans() {
    const plans = $("#plansGrid");
    if (!plans) return;
    let mode = "monthly";
    const update = () => {
      $$('[data-plan-card]', plans).forEach((card) => {
        const plan = planData[card.dataset.planCard];
        const price = mode === "monthly" ? plan.monthly : plan.yearly;
        $("[data-price]", card).textContent = F.formatMoney(price);
        $("[data-period]", card).textContent = mode === "monthly" ? "/ mes" : "/ año";
        $("[data-save]", card).textContent = mode === "yearly" ? "Ahorra 2 meses frente al pago mensual." : "Pago mensual, sin permanencia.";
        $("[data-choose-plan]", card).textContent = `Elegir ${mode === "monthly" ? "mensual" : "anual"}`;
      });
    };
    $$('[data-billing]', document).forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.billing;
      $$('[data-billing]', document).forEach((item) => item.classList.toggle("active", item === button));
      update();
    }));
    $$('[data-choose-plan]', plans).forEach((button) => button.addEventListener("click", () => openCheckout(button.closest("[data-plan-card]").dataset.planCard, mode)));
    update();
  }
  function openCheckout(planId, mode) {
    const plan = planData[planId];
    const price = mode === "monthly" ? plan.monthly : plan.yearly;
    openModal(`Activar ${plan.name}`, `Pago simulado · ${F.formatMoney(price)} ${mode === "monthly" ? "al mes" : "al año"}.`, `
      <form id="checkoutForm" novalidate>
        <div class="field"><label>Nombre en la tarjeta <span>*</span></label><input class="input" name="cardName" required placeholder="Ej. Sebastián Escobar"></div>
        <div class="field" style="margin-top:14px"><label>Últimos 4 dígitos <span>*</span></label><input class="input" name="lastFour" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required placeholder="1234"></div>
        <div class="notice">Este formulario no procesa pagos reales. Al confirmar, se registra el plan en localStorage y se activa el descuento del ${Math.round(plan.discount * 100)}% para la calculadora.</div>
        <button class="btn btn-primary" type="submit" style="width:100%;margin-top:18px">Confirmar activación</button>
      </form>`, (backdrop) => {
      $("#checkoutForm", backdrop).addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) { form.reportValidity(); return; }
        F.setMembership({ id: planId, name: plan.name, billing: mode, discount: plan.discount, price, lastFour: new FormData(form).get("lastFour"), activatedAt: new Date().toISOString() });
        logActivity("Plan activado", `Se activó ${plan.name} en modalidad ${mode === "monthly" ? "mensual" : "anual"}.`);
        closeModal();
        showToast(`${plan.name} activado. El descuento ya aparece en la calculadora.`);
        window.setTimeout(() => { window.location.href = pageLink("panel-cliente.html"); }, 600);
      });
    });
  }

  function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    const session = F.getSession();
    const user = F.getUsers().find((item) => item.email === session?.email);
    if (user) { $("#contactName").value = user.name; $("#contactEmail").value = user.email; }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const values = Object.fromEntries(new FormData(form).entries());
      const ticket = { id: F.generateCode("SUP"), ...values, status: "Abierto", createdAt: new Date().toISOString(), ownerEmail: user?.email || values.email };
      const tickets = F.getTickets(); tickets.unshift(ticket); F.saveTickets(tickets);
      logActivity("Consulta enviada", `Se registró la consulta ${ticket.id} con el asunto: ${ticket.subject}.`);
      $("#contactResult").innerHTML = `<div class="result-card"><div class="guide-code">✓ Consulta enviada</div><h2>Tu número de soporte es ${ticket.id}</h2><p class="text-muted">Guardamos tu consulta con el asunto “${escapeHTML(ticket.subject)}”. En este prototipo se puede revisar también desde el panel de administrador.</p></div>`;
      form.reset(); if (user) { $("#contactName").value = user.name; $("#contactEmail").value = user.email; }
      $("#contactResult").scrollIntoView({ behavior: "smooth", block: "center" });
      showToast(`Consulta registrada con el código ${ticket.id}.`);
    });
  }

  function redirectAfterLogin(session) { window.location.href = pageLink(session.role === "admin" ? "panel-admin.html" : "panel-cliente.html"); }
  function initAuth() {
    const loginForm = $("#loginForm");
    const registerForm = $("#registerForm");
    if (!loginForm && !registerForm) return;
    $("#showRegister")?.addEventListener("click", () => { $("#loginView").classList.add("hidden"); $("#registerView").classList.remove("hidden"); });
    $("#showLogin")?.addEventListener("click", () => { $("#registerView").classList.add("hidden"); $("#loginView").classList.remove("hidden"); });
    loginForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!loginForm.checkValidity()) { loginForm.reportValidity(); return; }
      const values = Object.fromEntries(new FormData(loginForm).entries());
      const user = F.getUsers().find((item) => item.email.toLowerCase() === String(values.email).toLowerCase() && item.password === values.password);
      if (!user) { showToast("Correo o contraseña incorrectos. Revisa las credenciales de demostración.", "error"); return; }
      const session = { id: user.id, name: user.name, email: user.email, role: user.role };
      F.setSession(session);
      logActivity("Inicio de sesión", `Ingresó al sistema como ${user.role === "admin" ? "administrador" : "cliente"}.`);
      showToast(`Bienvenido, ${user.name}.`);
      window.setTimeout(() => redirectAfterLogin(session), 450);
    });
    registerForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!registerForm.checkValidity()) { registerForm.reportValidity(); return; }
      const values = Object.fromEntries(new FormData(registerForm).entries());
      const users = F.getUsers();
      if (users.some((item) => item.email.toLowerCase() === String(values.email).toLowerCase())) { showToast("Ese correo ya tiene una cuenta registrada.", "error"); return; }
      if (String(values.password).length < 6) { showToast("La contraseña debe tener al menos 6 caracteres.", "error"); return; }
      const user = { id: `u-${Date.now()}`, name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password, role: "client", locker: `FBX-${Math.floor(1000 + Math.random() * 9000)}`, address: values.address.trim(), phone: values.phone.trim() };
      users.push(user); F.saveUsers(users);
      const session = { id: user.id, name: user.name, email: user.email, role: user.role }; F.setSession(session);
      showToast("Cuenta creada. Tu casillero ya está listo.");
      window.setTimeout(() => redirectAfterLogin(session), 450);
    });
  }

  function requireRole(role) {
    const session = F.getSession();
    if (!session || (role && session.role !== role)) {
      window.location.replace(pageLink("login.html"));
      return null;
    }
    return session;
  }
  function currentUser(session) { return F.getUsers().find((item) => item.email === session.email); }
  function packageRows(packages, admin = false) {
    if (!packages.length) return `<tr><td colspan="${admin ? 7 : 6}"><div class="empty-state">No hay paquetes registrados todavía.</div></td></tr>`;
    return packages.map((pkg) => `<tr>
      <td><a class="code-small" href="${pageLink("rastreo.html")}?guia=${pkg.guide}">${escapeHTML(pkg.guide)}</a></td>
      <td><span class="table-title">${escapeHTML(pkg.description)}</span><span class="table-sub">${escapeHTML(pkg.store)} · ${Number(pkg.weight).toFixed(1)} lb</span></td>
      ${admin ? `<td>${escapeHTML(pkg.recipient)}</td>` : ""}
      <td>${statusBadge(pkg.status)}</td>
      <td class="amount">${F.formatMoney(pkg.shipping)}</td>
      <td>${pkg.paid ? `<span class="text-green">Pagado</span>` : `<span class="text-danger">Pendiente</span>`}</td>
      <td>${admin ? `<select class="status-select" data-status-guide="${pkg.guide}">${F.STATUS_ORDER.map((status) => `<option ${status === pkg.status ? "selected" : ""}>${status}</option>`).join("")}</select>` : `${pkg.paid ? `<a href="${pageLink("rastreo.html")}?guia=${pkg.guide}" class="btn btn-outline btn-sm">Ver</a>` : `<button type="button" class="btn btn-primary btn-sm" data-pay-guide="${pkg.guide}">Pagar</button>`}`}</td>
    </tr>`).join("");
  }
  function renderClientDashboard() {
    const session = requireRole("client");
    if (!session) return;
    const user = currentUser(session);
    const packages = F.getPackages().filter((pkg) => pkg.ownerEmail === session.email);
    const pendingPayment = packages.filter((pkg) => !pkg.paid).reduce((sum, pkg) => sum + Number(pkg.shipping), 0);
    $("#clientName").textContent = user.name.split(" ")[0];
    $("#profileAvatar").textContent = user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    $("#profileName").textContent = user.name;
    $("#profileEmail").textContent = user.email;
    $("#profileLocker").textContent = user.locker;
    $("#profileNameInput").value = user.name;
    $("#profileAddressInput").value = user.address || "";
    $("#profilePhoneInput").value = user.phone || "";
    $("#packageCount").textContent = packages.length;
    $("#inTransitCount").textContent = packages.filter((pkg) => ["Recibido en Miami", "En tránsito a Ecuador", "En aduana"].includes(pkg.status)).length;
    $("#pendingPayment").textContent = F.formatMoney(pendingPayment);
    $("#clientPackageRows").innerHTML = packageRows(packages, false);
    const membership = F.getMembership();
    $("#membershipDisplay").textContent = membership ? `${membership.name} · ${Math.round(membership.discount * 100)}% de descuento` : "Sin plan activo";
    $("#profileForm").onsubmit = (event) => {
      event.preventDefault();
      if (!event.currentTarget.checkValidity()) { event.currentTarget.reportValidity(); return; }
      const users = F.getUsers();
      const idx = users.findIndex((item) => item.email === session.email);
      users[idx].name = $("#profileNameInput").value.trim();
      users[idx].address = $("#profileAddressInput").value.trim();
      users[idx].phone = $("#profilePhoneInput").value.trim();
      F.saveUsers(users);
      F.setSession({ ...session, name: users[idx].name });
      logActivity("Perfil actualizado", "Se modificaron los datos del perfil del cliente.");
      showToast("Perfil actualizado correctamente.");
      renderClientDashboard();
    };
    $$('[data-pay-guide]').forEach((button) => { button.onclick = () => openPackagePayment(button.dataset.payGuide); });
    if ($("#logoutButton")) $("#logoutButton").onclick = () => { F.clearSession(); window.location.href = homeLink(); };
  }
  function openPackagePayment(guide) {
    const pkg = F.getPackages().find((item) => item.guide === guide);
    if (!pkg) return;
    openModal("Confirmar pago de envío", `${pkg.guide} · ${pkg.description}`, `
      <p style="margin-top:0">Total a pagar: <b style="font-size:1.2rem">${F.formatMoney(pkg.shipping)}</b></p>
      <form id="packagePaymentForm"><div class="field"><label>Forma de pago</label><select class="select" name="method"><option>Tarjeta (simulado)</option><option>Transferencia (simulado)</option></select></div><div class="notice">No se realiza un cargo real. Esta acción cambia el estado de factura a “Pagado” en el prototipo.</div><button class="btn btn-primary" style="width:100%;margin-top:17px">Registrar pago</button></form>`, (backdrop) => {
      $("#packagePaymentForm", backdrop).addEventListener("submit", (event) => {
        event.preventDefault();
        const packages = F.getPackages();
        const index = packages.findIndex((item) => item.guide === guide);
        packages[index].paid = true;
        packages[index].updatedAt = new Date().toISOString();
        F.savePackages(packages);
        logActivity("Pago registrado", `Se marcó como pagado el envío ${guide}.`);
        closeModal(); showToast("Pago registrado correctamente."); renderClientDashboard();
      });
    });
  }

  function renderAdminDashboard() {
    const session = requireRole("admin");
    if (!session) return;
    const packages = F.getPackages();
    const tickets = F.getTickets();
    $("#adminPackageCount").textContent = packages.length;
    $("#adminTransitCount").textContent = packages.filter((pkg) => ["Recibido en Miami", "En tránsito a Ecuador", "En aduana"].includes(pkg.status)).length;
    $("#adminTicketsCount").textContent = tickets.filter((ticket) => ticket.status === "Abierto").length;
    $("#adminPackageRows").innerHTML = packageRows(packages, true);
    $("#adminTicketRows").innerHTML = tickets.length ? tickets.map((ticket) => `<tr><td class="code-small">${escapeHTML(ticket.id)}</td><td><span class="table-title">${escapeHTML(ticket.subject)}</span><span class="table-sub">${escapeHTML(ticket.name)} · ${escapeHTML(ticket.email)}</span></td><td>${escapeHTML(ticket.priority || "Normal")}</td><td><select class="status-select" data-ticket-id="${ticket.id}"><option ${ticket.status === "Abierto" ? "selected" : ""}>Abierto</option><option ${ticket.status === "En revisión" ? "selected" : ""}>En revisión</option><option ${ticket.status === "Cerrado" ? "selected" : ""}>Cerrado</option></select></td></tr>`).join("") : `<tr><td colspan="4"><div class="empty-state">Todavía no hay consultas registradas.</div></td></tr>`;
    if ($("#saveStatusChanges")) $("#saveStatusChanges").onclick = () => {
      const all = F.getPackages();
      let changes = 0;
      $$('[data-status-guide]').forEach((select) => {
        const packageItem = all.find((item) => item.guide === select.dataset.statusGuide);
        if (packageItem && packageItem.status !== select.value) {
          const previousStatus = packageItem.status;
          packageItem.status = select.value;
          packageItem.updatedAt = new Date().toISOString();
          packageItem.history = packageItem.history || [];
          packageItem.history.push({ status: select.value, at: packageItem.updatedAt, detail: "Estado actualizado desde el panel de administración." });
          logActivity("Estado de paquete actualizado", `La guía ${packageItem.guide} cambió de ${previousStatus} a ${select.value}.`);
          changes += 1;
        }
      });
      F.savePackages(all);
      showToast(changes ? "Estados de paquetes guardados." : "No se realizaron cambios.");
      renderAdminDashboard();
    };
    if ($("#saveTicketChanges")) $("#saveTicketChanges").onclick = () => {
      const all = F.getTickets();
      $$('[data-ticket-id]').forEach((select) => { const ticket = all.find((item) => item.id === select.dataset.ticketId); if (ticket) ticket.status = select.value; });
      F.saveTickets(all); showToast("Estados de soporte actualizados."); renderAdminDashboard();
    };
    if ($("#adminPackageForm")) $("#adminPackageForm").onsubmit = (event) => {
      event.preventDefault();
      if (!event.currentTarget.checkValidity()) { event.currentTarget.reportValidity(); return; }
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const client = F.getUsers().find((user) => user.role === "client" && user.email.toLowerCase() === values.ownerEmail.toLowerCase()) || F.getUsers().find((user) => user.role === "client");
      const pkg = F.buildPackage({ ownerEmail: client.email, recipient: client.name, store: values.store, description: values.description, originalTracking: values.originalTracking, category: values.category, weight: values.weight, declaredValue: values.declaredValue, status: values.status, note: "Paquete creado por bodega desde el panel administrador." });
      const all = F.getPackages(); all.unshift(pkg); F.savePackages(all);
      logActivity("Paquete registrado por bodega", `Se creó la guía ${pkg.guide} para ${client.name}.`);
      event.currentTarget.reset(); showToast(`Paquete ${pkg.guide} creado para ${client.name}.`); renderAdminDashboard();
    };
    if ($("#adminLogoutButton")) $("#adminLogoutButton").onclick = () => { F.clearSession(); window.location.href = homeLink(); };
  }

  // Muestra la lista de acciones guardadas.
  function renderActivityLog() {
    const list = $("#activityList");
    if (!list) return;

    const activities = F.getActivities();
    if (!activities.length) {
      list.innerHTML = `<div class="empty-state">Todavía no hay acciones registradas. Prueba buscar una guía, agregar un producto o registrar una prealerta.</div>`;
      return;
    }

    list.innerHTML = activities.map((item) => `
      <article class="activity-item">
        <div class="activity-icon">✓</div>
        <div class="activity-main">
          <strong>${escapeHTML(item.action)}</strong>
          <p>${escapeHTML(item.description)}</p>
          <span>Usuario: ${escapeHTML(item.user || "Visitante")}</span>
        </div>
        <time class="activity-date">${F.formatDate(item.date)}</time>
      </article>`).join("");
  }

  // Carga la página de Bitácora. No hay botón para eliminar registros.
  function initActivityLog() {
    if (!$("#activityList")) return;

    logActivity(
      "Consulta de bitácora",
      "Se abrió la pantalla de actividad reciente del sistema."
    );

    renderActivityLog();
  }

  function initHomeQuickButtons() {
    $$('[data-add-product]').forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.addProduct)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    F.init();
    renderShell();
    initHomeQuickButtons();
    initCatalog();
    initTracking();
    initPackageRegistration();
    initCalculator();
    initPlans();
    initContact();
    initAuth();
    if ($("#clientDashboard")) renderClientDashboard();
    if ($("#adminDashboard")) renderAdminDashboard();
    initActivityLog();
  });
})();
