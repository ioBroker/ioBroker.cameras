var e=`iob-dialog-close`;function t(e){return!!e.form}var n=[`header`,`staticText`,`divider`];function r(e,t){return e==null?``:typeof e==`object`?e[t]||e.en||Object.values(e).find(e=>!!e)||``:String(e)}function i(e){let t={};for(let[r,i]of Object.entries(e.items||{}))i&&!n.includes(i.type)&&(t[r]=i.type);return t}function a(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?e.toString():JSON.stringify(e)}function o(e,t){if(t!=null)switch(e){case`number`:case`slider`:{if(typeof t==`number`)return Number.isFinite(t)?t:void 0;let e=a(t).trim().replace(`,`,`.`);if(!e)return;let n=Number(e);return Number.isFinite(n)?n:void 0}case`checkbox`:return t===!0||t===`true`||t===1||t===`1`;default:return a(t)}}function s(e,t){let n={};for(let[r,i]of Object.entries(e)){let e=o(i,t[r]);e!==void 0&&(n[r]=e)}return n}var c=`"Roboto", "Helvetica", "Arial", sans-serif`,l=Object.freeze({type:`light`,primary:`#3399CC`,primaryContrast:`#FFFFFF`,secondary:`#164477`,secondaryContrast:`#FFFFFF`,background:`#FFFFFF`,paper:`#FFFFFF`,text:`rgba(0, 0, 0, 0.87)`,textSecondary:`rgba(0, 0, 0, 0.6)`,divider:`rgba(0, 0, 0, 0.12)`,error:`#D32F2F`,warning:`#ED6C02`,info:`#0288D1`,success:`#2E7D32`,fontFamily:c,fontSize:14,borderRadius:4}),u=Object.freeze({type:`dark`,primary:`#4DABF5`,primaryContrast:`rgba(0, 0, 0, 0.87)`,secondary:`#436A93`,secondaryContrast:`#FFFFFF`,background:`#121212`,paper:`#121212`,text:`#FFFFFF`,textSecondary:`rgba(255, 255, 255, 0.7)`,divider:`rgba(255, 255, 255, 0.12)`,error:`#F44336`,warning:`#FFA726`,info:`#29B6F6`,success:`#66BB6A`,fontFamily:c,fontSize:14,borderRadius:4}),d=[`primary`,`primaryContrast`,`secondary`,`secondaryContrast`,`background`,`paper`,`text`,`textSecondary`,`divider`,`error`,`warning`,`info`,`success`,`fontFamily`],f=[`fontSize`,`borderRadius`];function p(e){return{...e===`dark`?u:l}}function m(e){if(!e||typeof e!=`object`)return p(typeof e==`string`?e:`light`);let t=e,n=p(typeof t.type==`string`?t.type:`light`);for(let e of d){let r=t[e];typeof r==`string`&&r.trim()&&(n[e]=r.trim())}for(let e of f){let r=t[e],i=typeof r==`string`?parseFloat(r):r;typeof i==`number`&&Number.isFinite(i)&&i>=0&&(n[e]=i)}return n}function h(e,t){return e.type===t.type&&d.every(n=>e[n]===t[n])&&f.every(n=>e[n]===t[n])}function g(e){return`--iob-${e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}`}function _(e){let t={};for(let n of d)t[g(n)]=e[n];for(let n of f)t[g(n)]=`${e[n]}px`;return t[`color-scheme`]=e.type,t}var v={ok:{en:`OK`,"zh-cn":`确定`},cancel:{en:`Cancel`,de:`Abbrechen`,ru:`Отмена`,pt:`Cancelar`,nl:`Annuleren`,fr:`Annuler`,it:`Annulla`,es:`Cancelar`,pl:`Anuluj`,uk:`Скасувати`,"zh-cn":`取消`},close:{en:`Close`,de:`Schließen`,ru:`Закрыть`,pt:`Fechar`,nl:`Sluiten`,fr:`Fermer`,it:`Chiudi`,es:`Cerrar`,pl:`Zamknij`,uk:`Закрити`,"zh-cn":`关闭`}},y=`
dialog {
    box-sizing: border-box;
    width: 480px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    padding: 0;
    border: 0;
    border-radius: calc(var(--iob-border-radius) * 2);
    background: var(--iob-paper);
    color: var(--iob-text);
    font-family: var(--iob-font-family);
    font-size: var(--iob-font-size);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
/* as the dialogs of MUI: a dark paper gets lighter the higher it lies */
dialog.dark { background-image: linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16)); }
dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
dialog:focus { outline: none; }
form { display: flex; flex-direction: column; height: 100%; max-height: inherit; margin: 0; }
header { display: flex; align-items: center; gap: 8px; padding: 12px 8px 12px 16px; font-size: 1.15em; font-weight: 500; }
header span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.body { flex: 1; min-height: 0; padding: 0 16px 16px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 16px 16px; }
button { font: inherit; padding: 6px 16px; border-radius: var(--iob-border-radius); border: 1px solid var(--iob-primary); background: transparent; color: var(--iob-primary); cursor: pointer; }
button.primary { background: var(--iob-primary); color: var(--iob-primary-contrast); }
button.close { border: 0; padding: 2px 8px; font-size: 1.4em; line-height: 1; color: var(--iob-text-secondary); }
label { display: flex; flex-direction: column; gap: 4px; }
label.check { flex-direction: row; align-items: center; gap: 8px; }
input, select, textarea { font: inherit; accent-color: var(--iob-primary); }
.help { color: var(--iob-text-secondary); font-size: 0.85em; }
h3 { margin: 4px 0 0; font-size: 1em; }
p { margin: 0; }
hr { width: 100%; border: 0; border-top: 1px solid var(--iob-divider); margin: 0; }
[hidden] { display: none !important; }
`;function b(e){if(!e)return null;try{let t=Function(`data`,`return (${e});`);return e=>{try{return!!t(e)}catch{return!1}}}catch{return null}}function x(e){return typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function S(e){let{input:t,setting:n}=e;if(t)return t instanceof HTMLInputElement&&t.type===`checkbox`?t.checked:t instanceof HTMLSelectElement?n.options?.[t.selectedIndex]?.value:t.value}function C(e,t,n,i,a){let o={name:t,setting:n,box:e.createElement(`div`),hidden:b(n.hidden),disabled:b(n.disabled)},s=r(n.label,a);switch(n.type){case`header`:return o.box=e.createElement(`h3`),o.box.textContent=r(n.text,a)||s,o;case`staticText`:return o.box=e.createElement(`p`),o.box.textContent=r(n.text,a)||s,o;case`divider`:return o.box=e.createElement(`hr`),o}let c=e.createElement(`label`);o.box=c;let l=e.createElement(`span`);if(l.textContent=s||t,n.type===`checkbox`){let t=e.createElement(`input`);t.type=`checkbox`,t.checked=i===!0||i===`true`,c.className=`check`,c.append(t,l),o.input=t}else if(n.type===`select`){let t=e.createElement(`select`);for(let i of n.options||[]){let n=e.createElement(`option`);n.textContent=r(i.label,a),t.append(n)}let s=(n.options||[]).findIndex(e=>String(e.value)===x(i));t.selectedIndex=s===-1?0:s,c.append(l,t),o.input=t}else if(n.type===`text`&&(n.minRows||1)>1){let t=e.createElement(`textarea`);t.rows=n.minRows||2,t.value=x(i),c.append(l,t),o.input=t}else{let t=e.createElement(`input`),r=x(i);switch(n.type){case`number`:case`slider`:t.type=n.type===`slider`?`range`:`number`,n.min!==void 0&&(t.min=String(n.min)),n.max!==void 0&&(t.max=String(n.max)),t.step=n.step===void 0?`any`:String(n.step);break;case`password`:t.type=`password`;break;case`color`:t.type=!r||/^#[0-9a-f]{6}$/i.test(r)?`color`:`text`;break;default:t.type=`text`}if(t.value=r,t.type===`range`){let n=e.createElement(`output`);n.textContent=t.value,t.addEventListener(`input`,()=>n.textContent=t.value),l.append(`: `,n)}c.append(l,t),o.input=t}if(n.help){let t=e.createElement(`span`);t.className=`help`,t.textContent=r(n.help,a),c.append(t)}return o}function w(n,a={}){let o=a.lang||`en`,c=document,l=e=>v[e][o]||v[e].en||e,u=c.createElement(`div`);u.setAttribute(`data-iob-dialog`,``);let d=u.attachShadow({mode:`open`}),f=c.createElement(`style`);f.textContent=y;let p=c.createElement(`dialog`),h=m(a.theme);p.className=h.type===`dark`?`dark`:``;for(let[e,t]of Object.entries(_(h)))p.style.setProperty(e,t);n.width&&(p.style.width=`${n.width}px`),n.height&&(p.style.height=`${n.height}px`);let g=c.createElement(`form`),b=c.createElement(`header`),x=c.createElement(`span`);x.textContent=r(n.title,o);let w=c.createElement(`button`);w.type=`button`,w.className=`close`,w.title=l(`close`),w.setAttribute(`aria-label`,l(`close`)),w.textContent=`×`,b.append(x,w);let T=c.createElement(`div`);return T.className=`body`,g.append(b,T),p.append(g),d.append(f,p),new Promise(a=>{let f=!1,m=e=>{f||(f=!0,p.open&&p.close(),u.remove(),a(e))};if(w.addEventListener(`click`,()=>m(null)),p.addEventListener(`close`,()=>m(null)),g.addEventListener(`submit`,e=>e.preventDefault()),t(n)){let e={},t=[];for(let[e,r]of Object.entries(n.form.items||{})){let i=n.data?.[e]??r.default,a=C(c,e,r,i,o);t.push(a),T.append(a.box)}let a=()=>{for(let n of t)n.input&&(e[n.name]=S(n));return e},u=()=>{let e=a();for(let n of t)n.box.hidden=n.hidden?n.hidden(e):!1,n.input&&(n.input.disabled=n.disabled?n.disabled(e):!1)};g.addEventListener(`input`,u),g.addEventListener(`change`,u),u();let d=t.find(e=>e.input&&!e.box.hidden&&!e.input.disabled);d?.input&&(d.input.autofocus=!0);let f=c.createElement(`footer`),p=c.createElement(`button`);p.type=`button`,p.textContent=r(n.cancel,o)||l(`cancel`),p.addEventListener(`click`,()=>m(null));let h=c.createElement(`button`);h.type=`submit`,h.className=`primary`,h.textContent=r(n.ok,o)||l(`ok`),f.append(p,h),g.append(f),g.addEventListener(`submit`,()=>m(s(i(n.form),a())))}else T.append(n.element),p.addEventListener(e,e=>m(e.detail??null));c.body.append(u),p.showModal(),d.activeElement&&d.activeElement!==w||(p.tabIndex=-1,p.focus())})}function T(e){return[...new Set(e.filter(e=>typeof e==`string`&&!!e))]}var E=[`socket`,`dialogs`,`theme`,`editMode`,`settings`,`value`],D=class extends HTMLElement{states={};objects={};#e=null;#t={};#n=m(`light`);#r=!1;#i=null;#a=void 0;#o=null;#s=!1;#c=(e,t)=>{this.#o?.states.includes(e)&&(this.states[e]=t||null,this.#_())};#l=(e,t)=>{this.#o?.objects.includes(e)&&(this.objects[e]=t||null,this.#d())};get socket(){return this.#e}set socket(e){this.#e=e||null,this.#d()}get settings(){return this.#t}set settings(e){this.#t=e||{},this.#d()}get theme(){return this.#n}set theme(e){let t=m(e);h(t,this.#n)||(this.#n=t,this.#u(),this.#_())}get editMode(){return this.#r}set editMode(e){let t=!!e;t!==this.#r&&(this.#r=t,this.#_())}get dialogs(){return this.#i}set dialogs(e){this.#i=e||null}get value(){return this.#a}set value(e){e!==this.#a&&(this.#a=e,this.#_())}connectedCallback(){for(let e of E)if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}this.#u(),this.#d()}disconnectedCallback(){this.#g()}getStateIds(e){return[]}getObjectIds(e){return[]}get systemLang(){return this.#e?.systemLang||`en`}text(e){return r(e,this.systemLang)}setState(e,t){return this.#e&&!this.#r?this.#e.setState(e,t):Promise.resolve()}changeValue(e){return this.#r||this.emit(`iob-change`,e)?!1:(this.value=e,!0)}emit(e,t){return this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0}))}async openDialog(e){if(this.#r)return null;let n=this.#i?await this.#i.open(e):await w(e,{lang:this.systemLang,theme:this.#n});return t(e)?n&&typeof n==`object`?s(i(e.form),n):null:n??null}#u(){for(let[e,t]of Object.entries(_(this.#n)))this.style.setProperty(e,t)}#d(){if(!this.isConnected)return;let e=this.#e,t=e?T(this.getStateIds(this.#t)):[],n=e?T(this.getObjectIds(this.#t)):[];this.#o&&this.#o.socket!==e&&this.#g();let r=this.#o?.states||[],i=this.#o?.objects||[],a=r.filter(e=>!t.includes(e)),o=i.filter(e=>!n.includes(e)),s=t.filter(e=>!r.includes(e)),c=n.filter(e=>!i.includes(e));e&&a.length&&e.unsubscribeState(a,this.#c),e&&o.length&&this.#h(e,o);for(let e of a)delete this.states[e];for(let e of[...a,...o])!t.includes(e)&&!n.includes(e)&&delete this.objects[e];this.#o=e&&(t.length||n.length)?{socket:e,states:t,objects:n}:null,e&&s.length&&this.#p(e,s),e&&c.length&&this.#m(e,c),this.#_()}#f(e,t,n){return this.#o?.socket===e&&this.#o[t].includes(n)}#p(e,t){e.subscribeState(t,this.#c).catch(e=>console.warn(`<${this.localName}>: cannot subscribe ${t.join(`, `)}: ${e}`));for(let n of t)e.getState(n).then(t=>{this.#f(e,`states`,n)&&this.states[n]===void 0&&(this.states[n]=t||null,this.#_())}).catch(()=>{}),e.getObject(n).then(t=>{this.#f(e,`states`,n)&&!this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#_())}).catch(()=>{})}#m(e,t){e.subscribeObject(t,this.#l).catch(e=>console.warn(`<${this.localName}>: cannot subscribe the objects ${t.join(`, `)}: ${e}`));for(let n of t)e.getObject(n).then(t=>{this.#f(e,`objects`,n)&&(this.objects[n]=t||null,this.#d())}).catch(()=>{})}#h(e,t){e.unsubscribeObject(t,this.#l).catch(()=>{})}#g(){if(this.#o){let{socket:e,states:t,objects:n}=this.#o;t.length&&e.unsubscribeState(t,this.#c),n.length&&this.#h(e,n),this.#o=null}this.states={},this.objects={}}#_(){this.#s||(this.#s=!0,queueMicrotask(()=>{this.#s=!1,this.isConnected&&this.render()}))}};function O(e,t){let n=typeof e==`string`?e:e.tag;customElements.get(n)||customElements.define(n,t)}function k(e){if(!e)return null;if(e.includes(`/`)){let[t,n]=e.split(`/`);return!t||!n?null:{instanceId:t,name:n,instance:`cameras.${t}`}}let t=e.split(`.`);if(t[0]!==`cameras`||t.length<3)return null;let n=t[1],r=t.slice(2);r.length>1&&(r[r.length-1]===`running`||r[r.length-1]===`stream`)&&r.pop();let i=r.join(`.`);return i?{instanceId:n,name:i,instance:`cameras.${n}`}:null}function A(e,t=`image/jpeg`){return`data:${t};base64,${e}`}var j={chooseCamera:`Choose a camera in the settings`,notCamera:`Not a camera of the cameras adapter`,loading:`Loading…`,inactive:`Camera instance is not running`,noPicture:`Cannot get the picture`},M={en:j,de:{chooseCamera:`Kamera in den Einstellungen wählen`,notCamera:`Keine Kamera des Adapters cameras`,loading:`Wird geladen…`,inactive:`Kamera-Instanz läuft nicht`,noPicture:`Bild kann nicht geladen werden`},ru:{chooseCamera:`Выберите камеру в настройках`,notCamera:`Это не камера адаптера cameras`,loading:`Загрузка…`,inactive:`Экземпляр камеры не запущен`,noPicture:`Не удаётся получить изображение`},pt:{chooseCamera:`Escolha uma câmera nas configurações`,notCamera:`Não é uma câmera do adaptador cameras`,loading:`Carregando…`,inactive:`A instância da câmera não está em execução`,noPicture:`Não é possível obter a imagem`},nl:{chooseCamera:`Kies een camera in de instellingen`,notCamera:`Geen camera van de adapter cameras`,loading:`Laden…`,inactive:`Camera-instantie draait niet`,noPicture:`Kan de afbeelding niet ophalen`},fr:{chooseCamera:`Choisissez une caméra dans les paramètres`,notCamera:`Pas une caméra de l'adaptateur cameras`,loading:`Chargement…`,inactive:`L’instance de la caméra ne fonctionne pas`,noPicture:`Impossible d'obtenir l'image`},it:{chooseCamera:`Scegli una telecamera nelle impostazioni`,notCamera:`Non è una telecamera dell'adattatore cameras`,loading:`Caricamento…`,inactive:`L’istanza della telecamera non è in esecuzione`,noPicture:`Impossibile ottenere l'immagine`},es:{chooseCamera:`Elija una cámara en la configuración`,notCamera:`No es una cámara del adaptador cameras`,loading:`Cargando…`,inactive:`La instancia de la cámara no se está ejecutando`,noPicture:`No se puede obtener la imagen`},pl:{chooseCamera:`Wybierz kamerę w ustawieniach`,notCamera:`To nie jest kamera adaptera cameras`,loading:`Ładowanie…`,inactive:`Instancja kamery nie działa`,noPicture:`Nie można pobrać obrazu`},uk:{chooseCamera:`Виберіть камеру в налаштуваннях`,notCamera:`Це не камера адаптера cameras`,loading:`Завантаження…`,inactive:`Екземпляр камери не запущено`,noPicture:`Не вдається отримати зображення`},"zh-cn":{chooseCamera:`请在设置中选择摄像机`,notCamera:`不是 cameras 适配器的摄像机`,loading:`加载中…`,inactive:`摄像机实例未运行`,noPicture:`无法获取图像`}};function N(e,t){return M[e]?.[t]||j[t]}var P=`
:host {
    display: block;
    width: 100%;
    height: 100%;
}
.box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* the size of the box does not depend on what is in it */
    container-type: size;
}
.title {
    flex: none;
    padding: 0 0.4em 0.3em;
    font-size: clamp(11px, 7cqmin, 18px);
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.title[hidden] {
    display: none;
}
.picture {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    background: color-mix(in srgb, currentColor 6%, transparent);
    -webkit-tap-highlight-color: transparent;
}
.picture.has-picture {
    background: transparent;
}
.picture.clickable {
    cursor: zoom-in;
}
.picture.edit {
    pointer-events: none;
}
.picture:focus-visible {
    outline: 2px solid var(--iob-primary, currentColor);
    outline-offset: -2px;
}
img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
img[hidden] {
    display: none;
}
.hint {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    padding: 0.6em;
    text-align: center;
    font-size: clamp(11px, 5.5cqmin, 15px);
    color: var(--iob-text-secondary, inherit);
    overflow: hidden;
    overflow-wrap: anywhere;
}
.hint[hidden] {
    display: none;
}
/* over a picture that is not current any more */
.hint.over {
    background: color-mix(in srgb, var(--iob-paper, #fff) 72%, transparent);
    color: var(--iob-text, inherit);
}
.hint.error {
    color: var(--iob-error, #f44336);
}
.hint svg {
    width: clamp(20px, 14cqmin, 44px);
    height: clamp(20px, 14cqmin, 44px);
    fill: currentColor;
    opacity: 0.6;
    flex: none;
}
`,F=`
:host {
    display: block;
}
.full {
    position: relative;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--iob-text, inherit);
}
img {
    display: block;
    max-width: 100%;
    max-height: 75vh;
    margin: 0 auto;
    object-fit: contain;
}
img[hidden] {
    display: none;
}
.hint {
    padding: 1em;
    text-align: center;
    color: var(--iob-text-secondary, inherit);
}
.hint[hidden] {
    display: none;
}
.hint.over {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--iob-paper, #fff) 72%, transparent);
    color: var(--iob-text, inherit);
}
.hint.error {
    color: var(--iob-error, #f44336);
}
`,I=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,L=15e3,R=1e3;async function z(e,t){let n,r=new Promise((e,t)=>{n=setTimeout(()=>t(/* @__PURE__ */ Error(``)),L)});try{let n=await Promise.race([e.sendTo(t.camera.instance,`image`,{name:t.camera.name,width:t.width,angle:t.angle,noCache:t.noCache,noFileWrite:!0}),r]);if(n?.data)return A(n.data,n.contentType||`image/jpeg`);throw Error(typeof n?.error==`string`?n.error:``)}finally{clearTimeout(n)}}var B=class{#e;#t;#n;#r;#i=!1;constructor(e,t,n){this.#e=e,this.#t=t,this.#n=n,this.#a()}stop(){this.#i=!0,clearTimeout(this.#r)}async#a(){let e;try{e={picture:await z(this.#e,this.#t)}}catch(t){e={error:t instanceof Error?t.message:String(t)}}this.#i||this.#n(e),this.#i||(this.#r=setTimeout(()=>void this.#a(),this.#t.interval))}};function V(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n.appendChild(r),r}function H(e){return`system.adapter.${e.instance}.alive`}function U(e,t){return e.instance===t.instance&&e.name===t.name}var W=class extends D{#e;#t;#n;#r;#i;#a=null;#o=``;#s=null;#c=``;#l=``;#u=``;#d=``;#f=null;#p=!0;#m=null;constructor(){super();let e=this.attachShadow({mode:`open`});V(`style`,``,e).textContent=P;let t=V(`div`,`box`,e);this.#e=V(`div`,`title`,t),this.#e.hidden=!0,this.#t=V(`div`,`picture`,t),this.#n=V(`img`,``,this.#t),this.#n.alt=``,this.#n.hidden=!0,this.#r=V(`div`,`hint`,this.#t),this.#r.hidden=!0,V(`span`,``,this.#r).innerHTML=I,this.#i=V(`span`,``,this.#r),this.#t.addEventListener(`click`,()=>this.#v()),this.#t.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.#v())})}getDialogCamera(e,t){return e}connectedCallback(){super.connectedCallback(),document.addEventListener(`visibilitychange`,this.#h),typeof IntersectionObserver<`u`&&(this.#m=new IntersectionObserver(e=>{let t=e.some(e=>e.isIntersecting);t!==this.#p&&(this.#p=t,this.render())}),this.#m.observe(this))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`visibilitychange`,this.#h),this.#m?.disconnect(),this.#m=null,this.#p=!0,this.#_(),queueMicrotask(()=>{!this.isConnected&&this.#f&&this.#f.dispatchEvent(new CustomEvent(e,{detail:null,bubbles:!0,composed:!0}))})}getStateIds(e){let t=k(e.camera);return t?[H(t)]:[]}render(){if(!this.isConnected)return;let e=this.settings,t=k(e.camera),n=e=>N(this.systemLang,e),r=t?`${t.instance}.${t.name}`:``;r!==this.#l&&(this.#c=``,this.#d=``,this.#l=r);let i=t?this.states[H(t)]:void 0,a=``,o=!1,s=null;e.camera?t?i!==void 0&&!i?.val?a=n(`inactive`):(s=this.getRequest(t,e,!1),this.#d?(a=this.#d,o=!0):this.#c||(a=n(`loading`))):a=n(`notCamera`):a=n(`chooseCamera`),this.#g(s),this.#e.textContent=e.title||``,this.#e.hidden=!e.title;let c=!!t&&!this.editMode;this.#t.classList.toggle(`clickable`,c),this.#t.classList.toggle(`edit`,this.editMode),this.#t.classList.toggle(`has-picture`,!!this.#c),c?(this.#t.setAttribute(`role`,`button`),this.#t.tabIndex=0,this.#t.setAttribute(`aria-label`,e.title||t.name)):(this.#t.removeAttribute(`role`),this.#t.removeAttribute(`tabindex`),this.#t.removeAttribute(`aria-label`)),this.#c!==this.#u&&(this.#u=this.#c,this.#c?this.#n.src=this.#c:this.#n.removeAttribute(`src`)),this.#n.hidden=!this.#c,this.#n.alt=t?.name||``,this.#r.hidden=!a,this.#i.textContent=a,this.#r.classList.toggle(`over`,!!a&&!!this.#c),this.#r.classList.toggle(`error`,o)}#h=()=>this.render();#g(e){let t=this.socket,n=!!e&&!!t&&this.#p&&document.visibilityState!==`hidden`&&!this.#f,r=n?JSON.stringify(e):``;(r!==this.#o||r&&t!==this.#s)&&(this.#_(),n&&e&&t&&(this.#o=r,this.#s=t,this.#a=new B(t,e,e=>{e.picture===void 0?this.#d=e.error||N(this.systemLang,`noPicture`):(this.#c=e.picture,this.#d=``),this.render()})))}#_(){this.#a?.stop(),this.#a=null,this.#o=``,this.#s=null}#v(){let e=this.settings,t=k(e.camera),n=this.socket;if(!t||!n||this.editMode||this.#f)return;let r=this.getDialogCamera(t,e);if(!this.emit(`cameras-picture-click`,{instance:r.instance,camera:r.name}))return;let i=document.createElement(`div`);for(let[e,t]of Object.entries(_(this.theme)))i.style.setProperty(e,t);let a=i.attachShadow({mode:`open`});V(`style`,``,a).textContent=F;let o=V(`div`,`full`,a),s=V(`img`,``,o);s.alt=r.name;let c=V(`div`,`hint`,o),l=U(t,r),u=``,d=(e,t)=>{u&&s.getAttribute(`src`)!==u&&(s.src=u),s.hidden=!u,c.textContent=e,c.hidden=!e,c.classList.toggle(`over`,!!e&&!!u),c.classList.toggle(`error`,t)};u=l?this.#c:``,d(u?``:N(this.systemLang,`loading`),!1),this.#f=i,this.render();let f=new B(n,this.getRequest(r,e,!0),e=>{e.picture===void 0?d(e.error||N(this.systemLang,`noPicture`),!0):(u=e.picture,l&&(this.#c=e.picture,this.#d=``),d(``,!1))});this.openDialog({title:e.title||r.name,element:i,width:R}).catch(()=>null).finally(()=>{f.stop(),this.#f===i&&(this.#f=null),this.render()})}},G={rtsp:{tag:`iob-cameras-rtsp`,file:`cameras-rtsp`,entry:`./src/rtsp.ts`,deviceWidget:`RtspCameraComponent`},snapshot:{tag:`iob-cameras-snapshot`,file:`cameras-snapshot`,entry:`./src/snapshot.ts`,deviceWidget:`SnapshotCameraComponent`}},K=1280;function q(e,t){let n=e===void 0?640:Math.max(0,Math.round(e));return t&&n?Math.max(K,n):n}function J(e){let t=parseInt(e||`0`,10);return t===90||t===180||t===270?t:0}var Y=class extends W{getRequest(e,t,n){let r=n?t.pollingIntervalFull??500:t.pollingInterval??2e3;return{camera:e,width:q(t.width,n),angle:J(t.rotate),noCache:!!t.noCache,interval:Math.max(100,r)}}getDialogCamera(e,t){return k(t.bigCamera)||e}};O(G.snapshot.tag,Y);