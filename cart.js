function renderCart(){
 const c=getCart(), box=document.querySelector("#cart");
 if(!c.length){box.innerHTML="<p class='muted'>Tu pedido está vacío. <a href='/menu.html' style='color:#f28b24'>Ver menú →</a></p>";return}
 box.innerHTML=c.map((i,idx)=>`<div class="cart-row"><img src="${i.image}" alt=""><main><h3>${i.name}</h3><span class="price">${money(i.price)}</span></main><div class="qty"><button onclick="changeQty(${idx},-1)">−</button><b>${i.quantity}</b><button onclick="changeQty(${idx},1)">+</button></div><button class="linkbtn" onclick="removeItem(${idx})">×</button></div>`).join("");
 const subtotal=c.reduce((s,i)=>s+i.price*i.quantity,0);document.querySelector("#subtotal").textContent=money(subtotal);document.querySelector("#delivery").textContent=money(0);document.querySelector("#total").textContent=money(subtotal);
}
function changeQty(i,d){const c=getCart();c[i].quantity+=d;if(c[i].quantity<=0)c.splice(i,1);saveCart(c);renderCart()}
function removeItem(i){const c=getCart();c.splice(i,1);saveCart(c);renderCart()}
renderCart();