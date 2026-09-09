const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
fs.mkdirSync(DATA_DIR, { recursive: true });

const seed = {
  settings: {
    businessName: "GRILL'E",
    tagline: "Parrilla · Cortes · Experiencia",
    address: "Av. La Prensa y Los Olivos · Riobamba",
    phone: "098 338 2854",
    whatsapp: "593983382854",
    currency: "USD",
    deliveryEnabled: true
  },
  categories: [
    { id: "cortes", name: "Cortes", active: true, order: 1 },
    { id: "pinchos", name: "Pinchos", active: true, order: 2 },
    { id: "costillas", name: "Costillas", active: true, order: 3 },
    { id: "acompanamientos", name: "Acompañamientos", active: true, order: 4 },
    { id: "bebidas", name: "Bebidas", active: true, order: 5 }
  ],
  products: [
    { id:"p1", categoryId:"cortes", name:"T-Bone", description:"Corte premium, jugoso y lleno de sabor.", price:18, image:"/assets/products/tbone.jpg", available:true, featured:true },
    { id:"p2", categoryId:"costillas", name:"Costilla asada", description:"Sabor tradicional en cada bocado.", price:14, image:"/assets/products/costilla.jpg", available:true, featured:true },
    { id:"p3", categoryId:"pinchos", name:"Pincho GRILL'E", description:"Carne, pollo, pimiento y chorizo a la parrilla.", price:9.5, image:"/assets/products/pincho.jpg", available:true, featured:true },
    { id:"p4", categoryId:"acompanamientos", name:"Papas fritas", description:"Papas doradas y crujientes.", price:4, image:"/assets/products/papas.jpg", available:true, featured:false },
    { id:"p5", categoryId:"bebidas", name:"Coca-Cola 500ml", description:"Bebida fría.", price:2, image:"/assets/products/coca.jpg", available:true, featured:false }
  ],
  deliveryZones: [
    { id:"z1", name:"Zona 1 - Riobamba", fee:2, active:true }
  ],
  orders: [],
  users: []
};

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
let db = loadDb();

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function publicProduct(p) {
  return { ...p };
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autorizado" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/settings", (req,res) => res.json(db.settings));
app.get("/api/categories", (req,res) => res.json(db.categories.filter(c => c.active).sort((a,b)=>a.order-b.order)));
app.get("/api/products", (req,res) => {
  const category = req.query.category;
  const q = (req.query.q || "").toLowerCase();
  let items = db.products.filter(p => p.available);
  if (category) items = items.filter(p => p.categoryId === category);
  if (q) items = items.filter(p => `${p.name} ${p.description}`.toLowerCase().includes(q));
  res.json(items.map(publicProduct));
});
app.get("/api/products/featured", (req,res) => {
  res.json(db.products.filter(p => p.available && p.featured).map(publicProduct));
});

app.post("/api/orders", (req,res) => {
  const { customer, type, address, reference, items, paymentMethod, notes } = req.body;
  if (!customer?.name || !customer?.phone || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Faltan datos del pedido" });
  }
  const normalized = items.map(i => {
    const p = db.products.find(x => x.id === i.productId && x.available);
    if (!p) throw new Error("Producto no disponible");
    const qty = Math.max(1, Number(i.quantity || 1));
    return { productId:p.id, name:p.name, price:p.price, quantity:qty, note:i.note || "" };
  });
  const subtotal = normalized.reduce((s,i)=>s + i.price*i.quantity, 0);
  const delivery = type === "delivery" ? 2 : 0;
  const total = subtotal + delivery;
  const order = {
    id: `GR-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    customer, type, address:address || "", reference:reference || "",
    items:normalized, subtotal, delivery, total,
    paymentMethod:paymentMethod || "cash",
    paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
    status:"new",
    notes:notes || ""
  };
  db.orders.unshift(order);
  saveDb();
  res.status(201).json({ order });
});

app.post("/api/payments/pagoplux/create", (req,res) => {
  // IMPORTANTE:
  // Este endpoint es un adaptador temporal. Cuando entregues el código/documentación
  // exacta de PagoPlux Sandbox/Production, reemplazaremos esta sección por la
  // integración oficial. Nunca pongas claves privadas de PagoPlux en el navegador.
  const { orderId } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error:"Pedido no encontrado" });

  res.json({
    mode: process.env.PAGOPLUX_ENV || "sandbox",
    orderId,
    integrationReady:false,
    message:"Configura aquí el WebCheckout/Script oficial de PagoPlux."
  });
});

app.post("/api/payments/pagoplux/webhook", (req,res) => {
  // Aquí se validará la firma/evento real de PagoPlux cuando se incorpore su documentación.
  const { orderId, status } = req.body;
  const order = db.orders.find(o => o.id === orderId);
  if (order && status) {
    order.paymentStatus = status;
    if (status === "approved") order.status = "confirmed";
    saveDb();
  }
  res.json({ ok:true });
});

// ADMIN
app.post("/api/admin/login", async (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@grille.ec";
  const adminPassword = process.env.ADMIN_PASSWORD || "CambiaEstaClave123!";
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error:"Credenciales incorrectas" });
  }
  const token = jwt.sign({ role:"admin", email }, JWT_SECRET, { expiresIn:"8h" });
  res.json({ token });
});

app.get("/api/admin/dashboard", auth, (req,res) => {
  const orders = db.orders;
  const today = new Date().toISOString().slice(0,10);
  const todayOrders = orders.filter(o => o.createdAt.slice(0,10) === today);
  const sales = todayOrders.reduce((s,o)=>s + o.total, 0);
  const pending = orders.filter(o => ["new","confirmed","preparing"].includes(o.status)).length;
  const avg = todayOrders.length ? sales/todayOrders.length : 0;
  res.json({
    salesToday:Number(sales.toFixed(2)),
    ordersToday:todayOrders.length,
    averageTicket:Number(avg.toFixed(2)),
    pendingOrders:pending,
    recentOrders:orders.slice(0,10)
  });
});

app.get("/api/admin/orders", auth, (req,res)=>res.json(db.orders));
app.patch("/api/admin/orders/:id", auth, (req,res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error:"Pedido no encontrado" });
  const allowed = ["new","confirmed","preparing","ready","sent","delivered","cancelled"];
  if (req.body.status && allowed.includes(req.body.status)) order.status = req.body.status;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  saveDb();
  res.json(order);
});

app.get("/api/admin/products", auth, (req,res)=>res.json(db.products));
app.post("/api/admin/products", auth, (req,res) => {
  const { name, description, price, categoryId, image, available=true, featured=false } = req.body;
  const product = {
    id:`p${Date.now()}`, name, description, price:Number(price),
    categoryId, image:image || "/assets/products/placeholder.jpg",
    available:Boolean(available), featured:Boolean(featured)
  };
  db.products.push(product); saveDb(); res.status(201).json(product);
});
app.patch("/api/admin/products/:id", auth, (req,res) => {
  const p = db.products.find(x=>x.id===req.params.id);
  if (!p) return res.status(404).json({error:"Producto no encontrado"});
  Object.assign(p, req.body);
  if (req.body.price !== undefined) p.price = Number(req.body.price);
  saveDb(); res.json(p);
});
app.delete("/api/admin/products/:id", auth, (req,res) => {
  db.products = db.products.filter(x=>x.id !== req.params.id);
  saveDb(); res.json({ok:true});
});

app.get("/api/admin/categories", auth, (req,res)=>res.json(db.categories));
app.post("/api/admin/categories", auth, (req,res) => {
  const category = { id:`cat${Date.now()}`, name:req.body.name, active:true, order:db.categories.length+1 };
  db.categories.push(category); saveDb(); res.status(201).json(category);
});

app.get("/api/admin/settings", auth, (req,res)=>res.json(db.settings));
app.patch("/api/admin/settings", auth, (req,res) => {
  Object.assign(db.settings, req.body); saveDb(); res.json(db.settings);
});

app.get("/api/admin/stats", auth, (req,res) => {
  const sales = db.orders.reduce((s,o)=>s+o.total,0);
  const byPayment = {};
  const best = {};
  for (const o of db.orders) {
    byPayment[o.paymentMethod] = (byPayment[o.paymentMethod] || 0) + o.total;
    for (const i of o.items) best[i.name] = (best[i.name] || 0) + i.quantity;
  }
  res.json({ totalSales:Number(sales.toFixed(2)), totalOrders:db.orders.length, byPayment, bestSellers:best });
});

app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`GRILL'E V2 ejecutándose en http://localhost:${PORT}`));
