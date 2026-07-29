// Service Worker - 适配 GitHub Pages 子目录部署
const CACHE_NAME = 'workbench-v11';

// 根据注册时传入的 scope 动态计算基础路径
// 使用相对路径缓存,避免硬编码根路径
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './english-sentences.json',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache add failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 网络优先策略 - 确保始终获取最新资源
self.addEventListener('fetch', event => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功获取,缓存副本(只缓存同源成功响应)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败时使用缓存
        return caches.match(event.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
