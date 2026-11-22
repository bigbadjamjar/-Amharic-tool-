/* ---------- colour schemes ----------
   A choice of colours, picked on the welcome page. Each scheme comes from one of Rob's palette files;
   the five colours shown on each button are that palette. The colours themselves are in css/schemes.css,
   made by tools/make_schemes.py so that text stays easy to read in every scheme, in light and dark mode.
   "Summer calm" is the original look and the default (its colours are at the top of css/style.css).

   The choice is kept with each profile, and also on this device (amharic-scheme) so the welcome page
   and the name page show it before anyone has picked a profile. A profile that never chose one uses
   the device's choice. */
const SCHEME_KEY = "amharic-scheme";
const SCHEMES = [
  {id:"summer",  name:"Summer calm",     about:"Dusk indigo, sea glass and sand. The original look, and the default.", sw:["413C58","A3C4BC","BFD7B5","E7EFC5","F2DDA4"]},
  {id:"lake",    name:"Lake Tana",       about:"Deep lake blue with fresh spring green.",            sw:["05668D","427AA1","EBF2FA","679436","A5BE00"]},
  {id:"forest",  name:"Simien forest",   about:"Mountain greens, from pine to new leaves.",          sw:["132A13","31572C","4F772D","90A955","ECF39E"]},
  {id:"coffee",  name:"Coffee ceremony", about:"Roasted brown, rose and cream.",                     sw:["724319","D88180","F7B1B0","FEEAC7","CAD182"]},
  {id:"lagoon",  name:"Red Sea lagoon",  about:"Turquoise water, warm sand and coral.",              sw:["0081A7","00AFB9","FDFCDC","FED9B7","F07167"]},
  {id:"harar",   name:"Harar spice",     about:"Dark teal with saffron, turmeric and paprika.",      sw:["264653","2A9D8F","E9C46A","F4A261","E76F51"]},
  {id:"addis",   name:"Addis evening",   about:"Night blue with a golden sunset.",                   sw:["0D3B66","FAF0CA","F4D35E","EE964B","F95738"]},
  {id:"meskel",  name:"Meskel daisy",    about:"Bright yellow flowers and green fields.",            sw:["FB6107","F3DE2C","7CB518","5C8001","FBB02D"]},
  {id:"mist",    name:"Highland mist",   about:"Soft greys with a hint of mauve. Very calm.",        sw:["FBFBF2","E5E6E4","CFD2CD","A6A2A2","847577"]},
  {id:"blossom", name:"Blossom",         about:"Pastel sky blue and pink, with a light header.",     sw:["7BDFF2","B2F7EF","EFF7F6","F7D6E0","F2B5D4"]},
];
const SCHEME_DEF = "summer";
const schemeOk = id => SCHEMES.some(s => s.id === id);
const schemeDevice = {
  get(){ try { const v = localStorage.getItem(SCHEME_KEY); return schemeOk(v) ? v : SCHEME_DEF; } catch (e) { return SCHEME_DEF; } },
  set(id){ try { localStorage.setItem(SCHEME_KEY, id); } catch (e) {} },
};

/* Put a scheme on the page: the <html> tag carries it, and the phone's status bar follows the header colour. */
function schemeApply(id){
  if (!schemeOk(id)) id = SCHEME_DEF;
  const root = document.documentElement;
  if (id === SCHEME_DEF) root.removeAttribute("data-scheme"); else root.setAttribute("data-scheme", id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) { const c = getComputedStyle(root).getPropertyValue("--theme").trim(); if (c) meta.setAttribute("content", c); }
}

/* The picker on the welcome page: one button per scheme, each showing its five palette colours. */
function renderSchemes(cur){
  return `<h3 id="colours">Colours</h3>
    <p class="count schint">Pick the colours you like. Your choice is kept with your name, on this device.</p>
    <div class="schgrid" role="radiogroup" aria-label="Colour scheme">` +
    SCHEMES.map(s => `<button class="schbtn" role="radio" aria-checked="${s.id === cur}" data-act="scheme" data-v="${s.id}">
        <span class="schsw nosay" aria-hidden="true">${s.sw.map(c => `<i style="background:#${c}"></i>`).join("")}</span>
        <b>${s.name}</b><small>${s.about}</small>
        <span class="schtick" aria-hidden="true">${s.id === cur ? "✓" : ""}</span></button>`).join("") +
    `</div>`;
}
