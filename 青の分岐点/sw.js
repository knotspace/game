/* 青の分岐点 PWA service worker */
const CACHE_NAME="ao-no-bunkiten-shell-v4";
const SHELL=["./index.html","./manifest.json","./icon.svg","./icon-192.png","./icon-512.png","./youth.js","./i18n/runtime.js"];
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await cache.add("./index.html");
  await Promise.allSettled(SHELL.slice(1).map(path=>cache.add(path)));
  await self.skipWaiting();
 })());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith("ao-no-bunkiten-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(req.mode==="navigate"){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   try{const fresh=await fetch(req);if(fresh.ok)cache.put("./index.html",fresh.clone());return fresh;}
   catch(error){return (await cache.match("./index.html"))||Response.error();}
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME),cached=await cache.match(req);
  if(cached)return cached;
  try{const response=await fetch(req);if(response.ok&&response.type==="basic")cache.put(req,response.clone());return response;}
  catch(error){return cached||Response.error();}
 })());
});
