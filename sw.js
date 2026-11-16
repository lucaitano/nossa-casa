/* Nossa Casa — service worker: abre rápido, funciona como app instalado e mostra as notificações. */
const VERSAO = 'nc-v1';
const BASE = ['./', 'index.html', 'app.js', 'config.js', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/badge-96.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Só a casca do app (esta pasta). O conteúdo vem sempre do Apps Script, ao vivo. Rede primeiro, cópia guardada se estiver sem internet. */
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request)
    .then(r => { const c = r.clone(); caches.open(VERSAO).then(k => k.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});

/* O Apps Script manda só dados (titulo, corpo, url); quem desenha a notificação é este arquivo. */
self.addEventListener('push', e => {
  let d = {};
  try { const j = e.data ? e.data.json() : {}; d = j.data || j; } catch (er) { d = { corpo: e.data ? e.data.text() : '' }; }
  const titulo = d.titulo || 'Nossa Casa';
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.corpo || '',
    icon: 'icones/icone-192.png',
    badge: 'icones/badge-96.png',
    tag: d.tag || 'nossa-casa',
    renotify: true,
    data: { url: d.url || self.registration.scope }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const alvo = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
    const aberto = lista.find(c => c.url.indexOf(self.registration.scope) === 0);
    return aberto ? aberto.focus() : self.clients.openWindow(alvo);
  }));
});
