/* ======= FOTOS ======= */
const IMG = {
  bolo:"images/bolo.jpg?v=2",
  bolos:"images/bolos-cardapio.jpg",
  mini:"images/mini-bolo.jpg"
};

/* ======= CONFIGURAÇÕES (edite aqui) ======= */
const WHATSAPP = "5511958606867";        // número com DDI+DDD
const INSTAGRAM = "https://www.instagram.com/tatacaseirinhos/"; // deixe vazio para ocultar

// Coberturas disponíveis
const COBERTURAS = ["Brigadeiro", "Beijinho", "Brigadeiro branco", "Creme de ninho"];

// Sabores dos bolos: [código, nome, preço sem cobertura]
const SABORES = [
  ["choc",   "chocolate", 25],
  ["cen",    "cenoura",   25],
  ["baun",   "baunilha",  25],
  ["fuba",   "fubá",      25],
  ["lar",    "laranja",   25],
  ["milho",  "milho",     30],
  ["pamonha","pamonha",   35],
  ["iog",    "iogurte",   30],
  ["coco",   "coco",      30]
];

const MENU = {
  bolos: {
    prefix: "Bolo de ",
    img: IMG.bolos, alt: "Bolo caseiro inteiro com cobertura branca e coco ralado",
    cap: "Bolos inteiros, feitos sob encomenda.",
    // preço do bolo COM cobertura (1 cobertura); nunca menor que o preço sem cobertura
    comCobertura: 35,
    maxCoberturas: 1,
    especiais: [
      {id:"vulc-ninho", n:"Vulcão com cobertura de ninho",     s:"Bolo Vulcão de cenoura ou chocolate", base:"Bolo Vulcão", cob:"cobertura de ninho",     p:45, sabores:["Cenoura","Chocolate"]},
      {id:"vulc-choc",  n:"Vulcão com cobertura de chocolate", s:"Bolo Vulcão de cenoura ou chocolate", base:"Bolo Vulcão", cob:"cobertura de chocolate", p:45, sabores:["Cenoura","Chocolate"]}
    ]
  },
  mini: {
    prefix: "Mini bolo de ",
    img: IMG.mini, alt: "Mini bolo com cobertura de chocolate",
    cap: "Individuais: ótimos para presentear ou para o lanche.",
    // mini: mesmo preço para todos os sabores
    precos: [13, 15, 20],            // sem cobertura, 1 cobertura, 2 coberturas
    maxCoberturas: 2,
    especiais: []
  }
};
/* ========================================== */

const $ = s => document.querySelector(s);
const brl = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---- preços e itens ---- */
function precoSabor(tipo, base, nCob){
  const g = MENU[tipo];
  if(tipo==="mini") return g.precos[nCob];
  return nCob ? Math.max(base, g.comCobertura) : base;
}
// chave do item no carrinho: tipo|id|cob1|cob2
const makeKey = (tipo,id,c1="",c2="") => [tipo,id,c1,c2].join("|");
function lineInfo(key){
  const [tipo,id,c1,c2] = key.split("|");
  const g = MENU[tipo]; if(!g) return null;
  const [eid,esab] = id.split(":");
  const esp = g.especiais.find(e=>e.id===eid);
  if(esp){
    if(!esp.sabores.includes(esab)) return null;
    return {n:`${esp.base} de ${esab.toLowerCase()}`, sub:"com "+esp.cob, p:esp.p};
  }
  const s = SABORES.find(x=>x[0]===id); if(!s) return null;
  const cobs = [c1,c2].filter(Boolean);
  if(cobs.some(c=>!COBERTURAS.includes(c)) || cobs.length>g.maxCoberturas) return null;
  return {
    n: g.prefix+s[1],
    sub: cobs.length ? "com "+cobs.map(c=>c.toLowerCase()).join(" e ") : "sem cobertura",
    p: precoSabor(tipo, s[2], cobs.length)
  };
}

let cart = {}, tab = "bolos";
try{ const s = JSON.parse(localStorage.getItem("tata-cart-v2")||"{}"); for(const k in s) if(s[k]>0 && lineInfo(k)) cart[k]=s[k]; }catch(e){}
const save = () => { try{ localStorage.setItem("tata-cart-v2", JSON.stringify(cart)); }catch(e){} };

const waBase = "https://wa.me/"+WHATSAPP;
document.querySelectorAll("[data-wa]").forEach(a=>a.href = waBase+"?text="+encodeURIComponent("Olá! Vim pelo site e gostaria de fazer um pedido."));
if(INSTAGRAM){ ["#insta","#insta-cta"].forEach(s=>$(s).href=INSTAGRAM); $("#insta-wrap").hidden=false; $("#insta-cta").hidden=false; }

/* ---- cardápio ---- */
const opts = (lista, excluir="") => lista.filter(x=>x!==excluir).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");
const saborOpts = `<option value="">Escolha o sabor do bolo</option>` + SABORES.map(s=>`<option value="${s[0]}">${esc(s[1][0].toUpperCase()+s[1].slice(1))}</option>`).join("");
const saborBase = id => SABORES.find(s=>s[0]===id)[2];

function renderMenu(){
  const g = MENU[tab];
  $("#menu-img").src = g.img; $("#menu-img").alt = g.alt; $("#menu-cap").textContent = g.cap;
  const pUm = tab==="mini" ? g.precos[1] : g.comCobertura;
  const base = g.prefix.replace(/ de $/,"");
  const head = (price,name,sub="") => `<div class="row1"><span class="price">${brl(price)}</span><span class="name">${name}${sub?`<small>${sub}</small>`:""}</span><span class="act"></span></div>`;

  const trad = SABORES.map(([id,nome,b])=>`
    <div class="opt" data-kind="trad" data-tipo="${tab}" data-id="${id}">${head(precoSabor(tab,b,0), g.prefix+nome)}</div>`).join("");

  const cob = COBERTURAS.map(c=>`
    <div class="opt" data-kind="cob" data-tipo="${tab}" data-cob="${esc(c)}">${head(pUm, `Cobertura de ${c.toLowerCase()}`)}
      <div class="sel"><select class="sab" aria-label="Sabor do bolo com ${esc(c.toLowerCase())}">${saborOpts}</select><small class="msg" hidden></small></div>
    </div>`).join("");

  const duas = g.maxCoberturas>1 ? `
    <div class="cat" id="sec-duas"><h3>Duas coberturas</h3><p class="info">Escolha o sabor do bolo e as duas coberturas.</p>
      <div class="opt" data-kind="duas" data-tipo="${tab}">${head(g.precos[2], `${base} com duas coberturas`)}
        <div class="sel">
          <select class="sab" aria-label="Sabor do bolo">${saborOpts}</select>
          <select class="c1" aria-label="Primeira cobertura"><option value="">1ª cobertura</option>${opts(COBERTURAS)}</select>
          <select class="c2" aria-label="Segunda cobertura"><option value="">2ª cobertura</option>${opts(COBERTURAS)}</select>
          <small class="msg" hidden></small>
        </div>
      </div></div>` : "";

  const especiais = g.especiais.length ? `
    <div class="cat" id="sec-esp"><h3>Especial</h3><p class="info">Escolha o sabor do Vulcão.</p>${g.especiais.map(e=>`
      <div class="opt" data-kind="esp" data-tipo="${tab}" data-id="${e.id}">${head(e.p, e.n, e.s)}
        <div class="sel"><select class="sab" aria-label="Sabor do ${esc(e.n)}">
          <option value="">Escolha o sabor do bolo</option>${e.sabores.map(s=>`<option value="${s}">${s}</option>`).join("")}
        </select><small class="msg" hidden></small></div>
      </div>`).join("")}</div>` : "";

  const chips = [["sec-trad","Tradicionais"],["sec-cob","Com cobertura"],...(duas?[["sec-duas","Duas coberturas"]]:[]),...(especiais?[["sec-esp","Especial"]]:[])]
    .map(([id,t])=>`<button type="button" class="chip" data-go="${id}">${t}</button>`).join("");
  $("#menu-list").innerHTML = `
    <div class="jump" aria-label="Ir para">${chips}</div>
    <div class="cat" id="sec-trad"><h3>Tradicionais (Sem cobertura)</h3><p class="info">Bolos sem cobertura. É só clicar em Adicionar.</p>${trad}</div>
    <div class="cat" id="sec-cob"><h3>Com cobertura</h3><p class="info">Escolha a cobertura e, dentro dela, o sabor do bolo.</p>${cob}</div>
    ${duas}${especiais}`;
  refreshBadges();
}

function rowQty(row){
  const t=row.dataset.tipo; let q=0;
  for(const k in cart){
    const [kt,id,c1,c2]=k.split("|"); if(kt!==t) continue;
    if(row.dataset.kind==="trad" && id===row.dataset.id && !c1) q+=cart[k];
    else if(row.dataset.kind==="esp" && id.split(":")[0]===row.dataset.id) q+=cart[k];
    else if(row.dataset.kind==="cob" && c1===row.dataset.cob && !c2) q+=cart[k];
    else if(row.dataset.kind==="duas" && c1 && c2) q+=cart[k];
  }
  return q;
}
// chave do item conforme o que está escolhido no cartão (null se faltar escolher algo)
function rowKey(row){
  const t=row.dataset.tipo, k=row.dataset.kind, v=s=>row.querySelector(s)?.value||"";
  if(k==="trad") return makeKey(t,row.dataset.id);
  if(k==="esp")  return v(".sab") ? makeKey(t,row.dataset.id+":"+v(".sab")) : null;
  if(k==="cob")  return v(".sab") ? makeKey(t,v(".sab"),row.dataset.cob) : null;
  return (v(".sab")&&v(".c1")&&v(".c2")) ? makeKey(t,v(".sab"),v(".c1"),v(".c2")) : null;
}
function actHTML(row){
  const key=rowKey(row), q=key?(cart[key]||0):0;
  return q
    ? `<span class="qty"><button type="button" data-d="-1" aria-label="Remover um">−</button><output>${q}</output><button type="button" data-d="1" aria-label="Adicionar um">+</button></span>`
    : `<button class="add" type="button">Adicionar</button>`;
}
function refreshBadges(){
  document.querySelectorAll("#menu-list .opt").forEach(row=>{
    row.querySelector(".act").innerHTML=actHTML(row);
    row.classList.toggle("on", rowQty(row)>0);
  });
}

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  tab=b.dataset.tab; document.querySelectorAll(".tab").forEach(x=>x.setAttribute("aria-selected",x===b)); renderMenu();
});

// no card de duas coberturas, a 2ª não repete a 1ª
$("#menu-list").addEventListener("change",e=>{
  const row=e.target.closest(".opt"); if(!row) return;
  e.target.classList.remove("err"); row.querySelectorAll(".msg").forEach(m=>m.hidden=true);
  if(row.dataset.kind==="duas" && e.target.classList.contains("c1")){
    const c2=row.querySelector(".c2"), keep=c2.value!==e.target.value?c2.value:"";
    c2.innerHTML=`<option value="">2ª cobertura</option>${opts(COBERTURAS,e.target.value)}`; c2.value=keep;
  }
  if(row.dataset.kind==="cob"){
    const id=row.querySelector(".sab").value;
    row.querySelector(".price").textContent = brl(precoSabor(row.dataset.tipo, id?saborBase(id):0, 1));
  }
  row.querySelector(".act").innerHTML=actHTML(row);
});

$("#menu-list").addEventListener("click",e=>{
  const go=e.target.closest("[data-go]");
  if(go){ document.getElementById(go.dataset.go)?.scrollIntoView({behavior:"smooth",block:"start"}); return; }
  const st=e.target.closest(".act button[data-d]");
  if(st){ const key=rowKey(st.closest(".opt")); if(key) change(key,+st.dataset.d); return; }
  const btn=e.target.closest("button.add"); if(!btn) return;
  const row=btn.closest(".opt");
  // se faltar escolher sabor/cobertura, destaca o campo
  const falta=[".sab",".c1",".c2"].map(s=>row.querySelector(s)).find(s=>s&&!s.value);
  if(falta){
    falta.classList.add("err"); falta.focus();
    const m=row.querySelector(".msg");
    if(m){ m.textContent = falta.classList.contains("sab") ? "Escolha o sabor do bolo para adicionar." : falta.classList.contains("c1") ? "Escolha a 1ª cobertura." : "Escolha a 2ª cobertura."; m.hidden=false; }
    return;
  }
  change(rowKey(row),1);
});

/* ---- carrinho ---- */
function change(key,d){
  const c=$("#cnt"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
  cart[key]=Math.max(0,(cart[key]||0)+d); if(!cart[key]) delete cart[key];
  save(); refreshBadges(); update();
}
function totals(){
  let n=0,t=0; for(const k in cart){ n+=cart[k]; t+=cart[k]*lineInfo(k).p; } return {n,t};
}
function message(){
  const {t}=totals();
  const tipo=document.querySelector("input[name=tipo]:checked").value;
  const nome=$("#f-nome").value.trim(), end=$("#f-end").value.trim(), data=$("#f-data").value.trim(), obs=$("#f-obs").value.trim();
  let m="Olá! Gostaria de fazer um pedido:\n\n";
  for(const k in cart){
    const i=lineInfo(k);
    m+=`• ${cart[k]}x ${i.n} (${i.sub}) — ${brl(cart[k]*i.p)}\n`;
  }
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
  lines.innerHTML = n ? Object.keys(cart).map(k=>{ const i=lineInfo(k); return `
    <div class="line" data-key="${esc(k)}">
      <div><div class="l-name">${esc(i.n)}</div><div class="l-sub">${esc(i.sub)} · ${brl(i.p)} cada</div></div>
      <div class="qty"><button data-d="-1" aria-label="Remover um">−</button><output>${cart[k]}</output><button data-d="1" aria-label="Adicionar um">+</button></div>
    </div>`;}).join("") : `<p class="empty">Seu pedido está vazio. Escolha algo no cardápio!</p>`;
  const send=$("#send");
  send.setAttribute("aria-disabled", n?"false":"true");
  send.href = n ? waBase+"?text="+encodeURIComponent(message()) : "#";
  if(!n) closeCart();
}
$("#lines").addEventListener("click",e=>{
  const b=e.target.closest("button[data-d]"); if(b) change(b.closest(".line").dataset.key,+b.dataset.d);
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
