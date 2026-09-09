document.querySelector("#loginForm").onsubmit=async e=>{
 e.preventDefault();const fd=new FormData(e.target);const data=Object.fromEntries(fd.entries());
 try{const r=await api("/api/admin/login",{method:"POST",body:JSON.stringify(data)});localStorage.setItem("grille_admin_token",r.token);location.href="/admin/"}catch(err){document.querySelector("#error").textContent=err.message}
};
async function api(url,opts={}){const r=await fetch(url,{headers:{"Content-Type":"application/json",...(opts.headers||{})},...opts});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Error");return d}