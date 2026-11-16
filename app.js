/* Nossa Casa — casca do app instalável.
   Abre o app do Apps Script em tela cheia e cuida das notificações (Firebase Cloud Messaging). */
const NC = window.NC || {};
const $ = id => document.getElementById(id);
const frame = $('app');
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
let fonte = null;          /* janela do app (dentro do iframe) que falou com a casca */
let registro = null;       /* service worker */
let token = '';

/* ---------- abrir o app ---------- */
if (!NC.app || NC.app.indexOf('COLE_AQUI') > -1) {
  $('abreMsg').textContent = 'Falta colocar o endereço do app no arquivo config.js.';
} else {
  frame.src = NC.app;
  frame.addEventListener('load', () => setTimeout(() => $('abre').classList.add('sai'), 350));
  setTimeout(() => { if (!$('abre').classList.contains('sai')) $('abreMsg').textContent = 'Abrindo a casa…'; }, 2500);
}

/* ---------- service worker ---------- */
const pronto = ('serviceWorker' in navigator)
  ? navigator.serviceWorker.register('sw.js').then(r => { registro = r; return navigator.serviceWorker.ready; }).catch(() => null)
  : Promise.resolve(null);

/* ---------- notificações ---------- */
const temFirebase = () => !!(NC.firebase && NC.firebase.apiKey && NC.firebase.projectId && NC.firebase.messagingSenderId && NC.firebase.appId && NC.vapid);
const suporte = () => ('Notification' in window) && ('serviceWorker' in navigator) && ('PushManager' in window);

function estadoNotif() {
  if (!suporte()) return 'indisponivel';
  if (!temFirebase()) return 'sem-config';
  return Notification.permission;
}

let mensageria = null;
async function pegarToken() {
  if (estadoNotif() !== 'granted') return '';
  try {
    const reg = await pronto;
    if (!reg) return '';
    if (!mensageria) {
      const { initializeApp } = await import(FB + 'firebase-app.js');
      const m = await import(FB + 'firebase-messaging.js');
      if (!(await m.isSupported())) return '';
      mensageria = { m, msg: m.getMessaging(initializeApp(NC.firebase)) };
    }
    token = await mensageria.m.getToken(mensageria.msg, { vapidKey: NC.vapid, serviceWorkerRegistration: registro || reg });
    return token || '';
  } catch (e) {
    console.warn('Notificações:', e);
    return '';
  }
}

async function contarProApp(extra) {
  if (!fonte) return;
  const t = estadoNotif() === 'granted' ? (token || await pegarToken()) : '';
  fonte.postMessage(Object.assign({ nc: 'pwa', notif: estadoNotif(), token: t, url: location.href.split('#')[0].split('?')[0] }, extra || {}), '*');
}

function mostrarFaixa(sim) { $('faixa').classList.toggle('on', !!sim); }

$('faixaNao').onclick = () => { mostrarFaixa(false); try { localStorage.setItem('nc_faixa', 'nao'); } catch (e) { /* ok */ } };
$('faixaSim').onclick = async () => {
  mostrarFaixa(false);
  let r = 'default';
  try { r = await Notification.requestPermission(); } catch (e) { /* navegador antigo */ }
  if (r === 'granted') {
    const t = await pegarToken();
    contarProApp(t ? {} : { erro: 'Permitido, mas o Firebase não devolveu o código do aparelho. Confiram o config.js.' });
  } else contarProApp();
};

/* ---------- conversa com o app (o app manda {nc:'app', tipo}) ---------- */
const doApp = w => { try { return w && (w === frame.contentWindow || w.parent === frame.contentWindow || w.parent.parent === frame.contentWindow); } catch (e) { return false; } };
window.addEventListener('message', e => {
  const d = e.data;
  if (!d || d.nc !== 'app' || !doApp(e.source)) return;
  fonte = e.source;
  if (d.tipo === 'ola') {
    contarProApp();
    const instalado = matchMedia('(display-mode: standalone)').matches;
    let recusou = false; try { recusou = localStorage.getItem('nc_faixa') === 'nao'; } catch (er) { /* ok */ }
    if (instalado && !recusou && estadoNotif() === 'default') setTimeout(() => mostrarFaixa(true), 1500);
  }
  if (d.tipo === 'pedirNotif') {
    const st = estadoNotif();
    if (st === 'default') mostrarFaixa(true);
    else contarProApp(st === 'granted' ? {} : { erro: st === 'denied' ? 'As notificações estão bloqueadas nas configurações do celular.' : '' });
  }
});
