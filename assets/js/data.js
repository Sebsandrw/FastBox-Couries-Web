/* Datos simulados del prototipo FastBox Courier.
   El sitio usa localStorage para que los registros sobrevivan al recargar la página. */
(function () {
  "use strict";

  const KEYS = {
    users: "fastbox_users_v1",
    packages: "fastbox_packages_v1",
    cart: "fastbox_cart_v1",
    session: "fastbox_session_v1",
    membership: "fastbox_membership_v1",
    tickets: "fastbox_tickets_v1",
    activity: "fastbox_activity_v1"
  };

  const CATEGORIES = {
    general: { label: "General", rate: 5.25, icon: "📦" },
    ropa: { label: "Ropa y calzado", rate: 4.60, icon: "👕" },
    tecnologia: { label: "Tecnología", rate: 7.50, icon: "💻" },
    fragil: { label: "Frágil", rate: 6.75, icon: "🧴" },
    accesorios: { label: "Accesorios", rate: 5.70, icon: "⌚" }
  };

  const STATUS_ORDER = [
    "Prealerta registrada",
    "Recibido en Miami",
    "En tránsito a Ecuador",
    "En aduana",
    "Listo para entrega",
    "Entregado"
  ];

  const DEFAULT_USERS = [
    {
      id: "u-client-001",
      name: "Sebastián Escobar",
      email: "cliente@fastbox.com",
      password: "Cliente123",
      role: "client",
      locker: "FBX-8472",
      address: "Cdla. Alborada, Guayaquil",
      phone: "099 123 4567"
    },
    {
      id: "u-admin-001",
      name: "Administrador FastBox",
      email: "admin@fastbox.com",
      password: "Admin123",
      role: "admin",
      locker: "ADMIN",
      address: "",
      phone: ""
    }
  ];

  const DEFAULT_PACKAGES = [
    {
      id: "pkg-001",
      guide: "FBX-123456",
      ownerEmail: "cliente@fastbox.com",
      recipient: "Sebastián Escobar",
      store: "Tienda deportiva",
      description: "Zapatillas deportivas",
      originalTracking: "USPS-940011189",
      category: "ropa",
      weight: 2.5,
      declaredValue: 72,
      shipping: 11.50,
      paid: false,
      status: "Recibido en Miami",
      createdAt: "2026-06-14T15:30:00",
      updatedAt: "2026-06-17T10:15:00",
      history: [
        { status: "Prealerta registrada", at: "2026-06-14T15:30:00", detail: "El cliente registró la compra para recepción." },
        { status: "Recibido en Miami", at: "2026-06-17T10:15:00", detail: "Paquete recibido y verificado en la bodega de Miami." }
      ]
    },
    {
      id: "pkg-002",
      guide: "FBX-987654",
      ownerEmail: "cliente@fastbox.com",
      recipient: "Sebastián Escobar",
      store: "Tienda de tecnología",
      description: "Audífonos inalámbricos",
      originalTracking: "UPS-1Z88K01",
      category: "tecnologia",
      weight: 1.4,
      declaredValue: 98,
      shipping: 12.50,
      paid: true,
      status: "En tránsito a Ecuador",
      createdAt: "2026-06-08T12:00:00",
      updatedAt: "2026-06-19T19:40:00",
      history: [
        { status: "Prealerta registrada", at: "2026-06-08T12:00:00", detail: "Compra prealertada por el cliente." },
        { status: "Recibido en Miami", at: "2026-06-12T09:25:00", detail: "Bodega de Miami confirmó la recepción." },
        { status: "En tránsito a Ecuador", at: "2026-06-19T19:40:00", detail: "Carga consolidada y despachada hacia Ecuador." }
      ]
    },
    {
      id: "pkg-003",
      guide: "FBX-456789",
      ownerEmail: "cliente@fastbox.com",
      recipient: "Sebastián Escobar",
      store: "Tienda de ropa",
      description: "Paquete de camisetas",
      originalTracking: "DHL-3927710",
      category: "ropa",
      weight: 1.2,
      declaredValue: 45,
      shipping: 8.50,
      paid: false,
      status: "Listo para entrega",
      createdAt: "2026-06-05T11:00:00",
      updatedAt: "2026-06-21T13:10:00",
      history: [
        { status: "Prealerta registrada", at: "2026-06-05T11:00:00", detail: "Prealerta creada." },
        { status: "Recibido en Miami", at: "2026-06-09T08:40:00", detail: "Paquete recibido en bodega." },
        { status: "En tránsito a Ecuador", at: "2026-06-14T20:20:00", detail: "Vuelo de carga confirmado." },
        { status: "En aduana", at: "2026-06-18T09:50:00", detail: "Documentación procesada para ingreso al país." },
        { status: "Listo para entrega", at: "2026-06-21T13:10:00", detail: "Disponible para entrega en Guayaquil." }
      ]
    }
  ];

  const PRODUCTS = [
    { id: "prd-1", title: "Audífonos inalámbricos", category: "tecnologia", weight: 1.1, price: 49.90, regularPrice: 59.90, stock: 8, icon: "🎧", description: "Audio portátil para registrar una compra tecnológica." },
    { id: "prd-2", title: "Smartwatch Fit", category: "tecnologia", weight: 0.8, price: 69.90, regularPrice: 79.90, stock: 5, icon: "⌚", description: "Reloj deportivo con peso estimado de bodega." },
    { id: "prd-3", title: "Laptop Pro 14\"", category: "tecnologia", weight: 4.6, price: 799.00, regularPrice: 849.00, stock: 2, icon: "💻", description: "Equipo de tecnología; requiere manejo especializado." },
    { id: "prd-4", title: "Chaqueta impermeable", category: "ropa", weight: 1.4, price: 38.00, regularPrice: 45.00, stock: 11, icon: "🧥", description: "Prenda ligera para compras de temporada." },
    { id: "prd-5", title: "Paquete de camisetas", category: "ropa", weight: 1.9, price: 27.50, regularPrice: 35.00, stock: 14, icon: "👕", description: "Combo de ropa con rebaja por compra agrupada." },
    { id: "prd-6", title: "Zapatillas Urban", category: "ropa", weight: 2.3, price: 55.00, regularPrice: 65.00, stock: 6, icon: "👟", description: "Calzado con estimación de peso por par." },
    { id: "prd-7", title: "Mochila de viaje", category: "accesorios", weight: 1.8, price: 42.00, regularPrice: 52.00, stock: 9, icon: "🎒", description: "Accesorio práctico para consolidar con otros artículos." },
    { id: "prd-8", title: "Kit de accesorios móviles", category: "accesorios", weight: 0.7, price: 18.90, regularPrice: 24.90, stock: 15, icon: "🔌", description: "Cable, soporte y adaptador en una sola compra." },
    { id: "prd-9", title: "Consola portátil", category: "tecnologia", weight: 1.6, price: 299.00, regularPrice: 299.00, stock: 0, icon: "🎮", description: "Producto de muestra sin stock disponible." }
  ];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch (error) {
      return clone(fallback);
    }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function init() {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, DEFAULT_USERS);
    if (!localStorage.getItem(KEYS.packages)) write(KEYS.packages, DEFAULT_PACKAGES);
    if (!localStorage.getItem(KEYS.cart)) write(KEYS.cart, []);
    if (!localStorage.getItem(KEYS.tickets)) write(KEYS.tickets, []);
    if (!localStorage.getItem(KEYS.activity)) write(KEYS.activity, []);
  }

  function getUsers() { return read(KEYS.users, DEFAULT_USERS); }
  function saveUsers(users) { write(KEYS.users, users); }
  function getPackages() { return read(KEYS.packages, DEFAULT_PACKAGES); }
  function savePackages(packages) { write(KEYS.packages, packages); }
  function getCart() { return read(KEYS.cart, []); }
  function saveCart(cart) { write(KEYS.cart, cart); }
  function getTickets() { return read(KEYS.tickets, []); }
  function saveTickets(tickets) { write(KEYS.tickets, tickets); }

  // Guarda las acciones importantes. La interfaz no ofrece opción para borrar la bitácora.
  function getActivities() { return read(KEYS.activity, []); }
  function saveActivities(activities) { write(KEYS.activity, activities); }
  function addActivity(action, description) {
    const session = getSession();
    const activities = getActivities();
    activities.unshift({
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      action,
      description,
      user: session ? session.name : "Visitante"
    });
    saveActivities(activities);
  }
  function getSession() { return read(KEYS.session, null); }
  function setSession(session) { write(KEYS.session, session); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function getMembership() { return read(KEYS.membership, null); }
  function setMembership(membership) { write(KEYS.membership, membership); }

  function formatMoney(amount) { return `$${Number(amount || 0).toFixed(2)}`; }
  function formatDate(iso) {
    if (!iso) return "Sin fecha";
    return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  }
  function generateCode(prefix) {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  function calculateShipping(weight, category, declaredValue, insured) {
    const selected = CATEGORIES[category] || CATEGORIES.general;
    const validWeight = Math.max(0, Number(weight) || 0);
    const base = validWeight ? Math.max(validWeight * selected.rate, 8.50) : 0;
    const insurance = insured ? Math.max(0, Number(declaredValue) || 0) * .02 : 0;
    const membership = getMembership();
    const discount = membership ? base * Number(membership.discount || 0) : 0;
    const total = Math.max(0, base + insurance - discount);
    return { rate: selected.rate, base, insurance, discount, total, membership };
  }

  function buildPackage(data) {
    const now = new Date().toISOString();
    const calc = calculateShipping(data.weight, data.category, data.declaredValue, Boolean(data.insured));
    return {
      id: `pkg-${Date.now()}`,
      guide: generateCode("FBX"),
      ownerEmail: data.ownerEmail || "cliente@fastbox.com",
      recipient: data.recipient,
      store: data.store,
      description: data.description,
      originalTracking: data.originalTracking || "Sin tracking original",
      category: data.category || "general",
      weight: Number(data.weight),
      declaredValue: Number(data.declaredValue || 0),
      shipping: calc.total,
      paid: false,
      status: data.status || "Prealerta registrada",
      createdAt: now,
      updatedAt: now,
      history: [{ status: data.status || "Prealerta registrada", at: now, detail: data.note || "Prealerta registrada por el cliente." }]
    };
  }

  window.FastBoxData = {
    KEYS,
    CATEGORIES,
    STATUS_ORDER,
    PRODUCTS,
    init,
    getUsers,
    saveUsers,
    getPackages,
    savePackages,
    getCart,
    saveCart,
    getTickets,
    saveTickets,
    getActivities,
    addActivity,
    getSession,
    setSession,
    clearSession,
    getMembership,
    setMembership,
    formatMoney,
    formatDate,
    generateCode,
    calculateShipping,
    buildPackage
  };
})();
