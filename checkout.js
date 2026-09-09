const form=document.querySelector("#checkoutForm");
document.querySelector("#type").onchange=e=>document.querySelector("#addressFields").style.display=e.target.value==="delivery"?"grid":"none";
form.onsubmit=async e=>{
 e.preventDefault();const c=getCart();if(!c.length)return alert("Tu pedido está vacío.");
 const fd=new FormData(form), data=Object.fromEntries(fd.entries());
 data.items=c.map(i=>({productId:i.productId,quantity:i.quantity}));
 try{
  const {order}=await api("/api/orders",{method:"POST",body:JSON.stringify(data)});
  if(data.paymentMethod==="pagoplux"){
    const pay=await api("/api/payments/pagoplux/create",{method:"POST",body:JSON.stringify({orderId:order.id})});
    document.querySelector("#result").innerHTML=`<div class="success"><h2>Pedido ${order.id} creado</h2><p>${pay.message}</p><p>El siguiente paso será abrir el checkout oficial de PagoPlux cuando incorporemos tu código Sandbox/Production.</p><a class="btn" href="/">Volver al inicio</a></div>`;
  } else {
    localStorage.removeItem(CART_KEY);updateCartCount();
    const msg=encodeURIComponent(`Hola GRILL'E, realicé el pedido ${order.id}. Total: ${money(order.total)}.`);
    document.querySelector("#result").innerHTML=`<div class="success"><h2>¡Pedido recibido!</h2><p>Número de pedido: <b>${order.id}</b></p><p>Total: <b>${money(order.total)}</b></p><a class="btn" target="_blank" href="https://wa.me/593983382854?text=${msg}">Enviar por WhatsApp</a></div>`;
    form.style.display="none";
  }
 }catch(err){document.querySelector("#result").innerHTML=`<p class="error">${err.message}</p>`}
};