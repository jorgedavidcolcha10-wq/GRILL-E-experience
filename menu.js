let category="";
async function render(){
  const q=document.querySelector("#search").value;
  const products=await api(`/api/products?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`);
  document.querySelector("#products").innerHTML=products.map(p=>`
  <article class="card">
    <img src="${p.image}" alt="${p.name}">
    <div class="card-body"><h3>${p.name}</h3><p>${p.description}</p><span class="price">${money(p.price)}</span>
    <button class="btn" onclick='addToCart(${JSON.stringify(p)})'>Agregar</button></div>
  </article>`).join("") || "<p class='muted'>No encontramos productos.</p>";
}
async function init(){
 const cats=await api("/api/categories");
 document.querySelector("#categories").innerHTML=`<button class="chip active" data-cat="">Todos</button>`+cats.map(c=>`<button class="chip" data-cat="${c.id}">${c.name}</button>`).join("");
 document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");category=b.dataset.cat;render()});
 document.querySelector("#search").oninput=render;
 render();
}
init();