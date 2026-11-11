/* ======= FOTOS ======= */
const IMG = {
  bolo:"images/bolo.jpg",
  mini:"images/mini-bolo.jpg"
};
/* ======= CONFIGURAÇÕES (edite aqui) ======= */
const WHATSAPP = "5511960400398";        // número com DDI+DDD
const INSTAGRAM = "https://www.instagram.com/tatacaseirinhos/"; // deixe vazio para ocultar
const MENU = {
  bolos: {
    img: IMG.bolo,
    alt: "Bolo caseiro inteiro",
    cap: "Bolos inteiros, feitos sob encomenda.",
    cats: [
      {t:"Tradicionais", items:[
        {id:"b-choc",  n:"Bolo de chocolate", p:27},
        {id:"b-cen",   n:"Bolo de cenoura",   p:27},
        {id:"b-baun",  n:"Bolo de baunilha",  p:25},
        {id:"b-fuba",  n:"Bolo de fubá",      p:25}]},
      {t:"Com cobertura", items:[
        {id:"b-choc-b", n:"Bolo de chocolate com brigadeiro", p:35},
        {id:"b-cen-b",  n:"Bolo de cenoura com brigadeiro",   p:35},
        {id:"b-beij",   n:"Bolo de beijinho",                 p:35}]},
      {t:"Especial", items:[
        {id:"b-vulc-cen",  n:"Bolo Vulcão de cenoura",   s:"Cenoura com cobertura", p:43},
        {id:"b-vulc-choc", n:"Bolo Vulcão de chocolate", s:"Chocolate com cobertura", p:43}]}
    ]},
  mini: {
    img: IMG.mini,
    alt: "Mini bolo com cobertura de chocolate",
    cap: "Individuais: ótimos para presentear ou para o lanche.",
    cats: [
      {t:"Tradicionais", items:[
        {id:"m-choc", n:"Mini bolo de chocolate", p:13},
        {id:"m-cen",  n:"Mini bolo de cenoura",   p:13},
        {id:"m-baun", n:"Mini bolo de baunilha",  p:13},
        {id:"m-fuba", n:"Mini bolo de fubá",      p:13}]},
      {t:"Com cobertura", items:[
        {id:"m-choc-b", n:"Mini bolo de chocolate com brigadeiro", p:15},
        {id:"m-cen-b",  n:"Mini bolo de cenoura com brigadeiro",   p:15},
        {id:"m-beij",   n:"Mini bolo de beijinho",                 p:15}]}
    ]}
};
/* ========================================== */

const $ = s => document.querySelector(s);
const brl = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const all = {}; Object.values(MENU).forEach(g=>g.cats.forEach(c=>c.items.forEach(i=>all[i.id]=i)));
let cart = {}, tab = "bolos";
try{ const s = JSON.parse(localStorage.getItem("tata-cart")||"{}"); for(const k in s) if(all[k]&&s[k]>0) cart[k]=s[k]; }catch(e){}
const save = () => { try{ localStorage.setItem("tata-cart", JSON.stringify(cart)); }catch(e){} };

const waBase = "https://wa.me/"+WHATSAPP;
document.querySelectorAll("[data-wa]").forEach(a=>a.href = waBase+"?text="+encodeURIComponent("Olá! Vim pelo site e gostaria de fazer um pedido."));
if(INSTAGRAM){ ["#insta","#insta-cta"].forEach(s=>$(s).href=INSTAGRAM); $("#insta-wrap").hidden=false; $("#insta-cta").hidden=false; }

function renderMenu(){
  const g = MENU[tab];
  $("#menu-img").src = g.img; $("#menu-img").alt = g.alt; $("#menu-cap").textContent = g.cap;
  $("#menu-list").innerHTML = g.cats.map(c=>`
    <div class="cat"><h3>${c.t}</h3>${c.items.map(i=>`
      <div class="item ${cart[i.id]?"on":""}" data-id="${i.id}">
        <span class="price">${brl(i.p)}</span>
        <span class="name">${i.n}${i.s?`<small>${i.s}</small>`:""}</span>
        <span class="qty">${cart[i.id]
          ? `<button data-d="-1" aria-label="Remover um">−</button><output>${cart[i.id]}</output><button data-d="1" aria-label="Adicionar um">+</button>`
          : `<button class="add" data-d="1">Adicionar</button>`}</span>
      </div>`).join("")}</div>`).join("");
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  tab=b.dataset.tab; document.querySelectorAll(".tab").forEach(x=>x.setAttribute("aria-selected",x===b)); renderMenu();
});
function change(id,d){
  cart[id]=Math.max(0,(cart[id]||0)+d); if(!cart[id]) delete cart[id];
  save(); renderMenu(); update();
}
$("#menu-list").addEventListener("click",e=>{
  const b=e.target.closest("button[data-d]"); if(b) change(b.closest(".item").dataset.id,+b.dataset.d);
});

function totals(){
  let n=0,t=0; for(const k in cart){ n+=cart[k]; t+=cart[k]*all[k].p; } return {n,t};
}
function message(){
  const {t}=totals();
  const tipo=document.querySelector("input[name=tipo]:checked").value;
  const nome=$("#f-nome").value.trim(), end=$("#f-end").value.trim(), data=$("#f-data").value.trim(), obs=$("#f-obs").value.trim();
  let m="Olá! Gostaria de fazer um pedido:\n\n";
  for(const k in cart) m+=`• ${cart[k]}x ${all[k].n} — ${brl(cart[k]*all[k].p)}\n`;
  m+=`\n*Total: ${brl(t)}*\n`;
  if(nome) m+=`\nNome: ${nome}`;
  m+=`\nReceber por: ${tipo}`;
  if(tipo==="Entrega"&&end) m+=`\nEndereço: ${end}`;
  if(data) m+=`\nPara quando: ${data}`;
  if(obs) m+=`\nObs.: ${obs}`;
  return m;
}
function update(){
  const {n,t}=totals();
  $("#cnt").textContent=n; $("#bar-total").textContent=brl(t); $("#total").textContent=brl(t);
  $("#cartbar").classList.toggle("show",n>0); document.body.classList.toggle("has-cart",n>0);
  const lines=$("#lines");
  lines.innerHTML = n ? Object.keys(cart).map(k=>`
    <div class="line" data-id="${k}">
      <div><div class="l-name">${all[k].n}</div><div class="l-sub">${brl(all[k].p)} cada</div></div>
      <div class="qty"><button data-d="-1" aria-label="Remover um">−</button><output>${cart[k]}</output><button data-d="1" aria-label="Adicionar um">+</button></div>
    </div>`).join("") : `<p class="empty">Seu pedido está vazio. Escolha algo no cardápio!</p>`;
  const send=$("#send");
  send.setAttribute("aria-disabled", n?"false":"true");
  send.href = n ? waBase+"?text="+encodeURIComponent(message()) : "#";
  if(!n) closeCart();
}
$("#lines").addEventListener("click",e=>{
  const b=e.target.closest("button[data-d]"); if(b) change(b.closest(".line").dataset.id,+b.dataset.d);
});
["f-nome","f-end","f-data","f-obs"].forEach(i=>$("#"+i).addEventListener("input",update));
document.querySelectorAll("input[name=tipo]").forEach(r=>r.addEventListener("change",()=>{
  $("#end-wrap").hidden = r.value!=="Entrega" || !r.checked; update();
}));
$("#copy").onclick=async()=>{
  try{ await navigator.clipboard.writeText(message()); $("#copy").textContent="Copiado!"; }
  catch(e){ $("#copy").textContent="Não foi possível copiar"; }
  setTimeout(()=>$("#copy").textContent="Copiar texto do pedido",2000);
};
const openCart=()=>{$("#drawer").classList.add("open");$("#overlay").classList.add("open")};
function closeCart(){$("#drawer").classList.remove("open");$("#overlay").classList.remove("open")}
$("#open-cart").onclick=openCart; $("#close-cart").onclick=closeCart; $("#overlay").onclick=closeCart;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});

renderMenu(); update();
