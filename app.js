const CART_KEY="grille_cart";
function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||"[]")}catch{return[]}}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c));updateCartCount()}
function updateCartCount(){const n=getCart().reduce((s,i)=>s+i.quantity,0);document.querySelectorAll("#cartCount").forEach(x=>x.textContent=n)}
function money(n){return `$${Number(n).toFixed(2)}`}
function addToCart(product){const c=getCart();const x=c.find(i=>i.productId===product.id);if(x)x.quantity++;else c.push({productId:product.id,name:product.name,price:product.price,image:product.image,quantity:1});saveCart(c);alert(`${product.name} agregado al pedido`)}
async function api(url,opts={}){const r=await fetch(url,{headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||"Error");return data}
document.addEventListener("DOMContentLoaded",updateCartCount);