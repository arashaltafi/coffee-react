// caches => open(select cache category for add, delete, match, ...)
// addAll(add multi address for cache)
// put(add req and res for cache)
// keys(see all caches)
// delete(delete caches)
// match (get cache file)

const cacheVersion = 1;
const activeCache = {
    static: `static-v${cacheVersion}`,
    dynamic: `dynamic-v${cacheVersion}`
}

self.addEventListener('install', (event) => {
    console.log('service worker install successful');
    self.skipWaiting();

    event.waitUntil(
        caches.open(activeCache.static).then((cache) => {
            console.log('cache static open successful');
            cache.addAll([
                '/',
                '/fallBack.html',
            ])
        })
    )
})

self.addEventListener('activate', (event) => {
    console.log('service worker activate successful');
    const activeCacheNames = Object.values(activeCache);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(element => {
                    console.log(element);
                    if (!activeCacheNames.includes(element)) {
                        return caches.delete(element)
                    }
                })
            )
        })
    )
})

self.addEventListener('fetch', (event) => {
    console.log('service worker fetch successful');
    ////1. first cache second network
    event.respondWith(
        caches.match(event.request).then((res) => {
            if (res) {
                return res
            } else {
                return fetch(event.request).then(res => {
                    return caches.open(activeCache.dynamic).then((cache) => {
                        console.log('cache dynamic open successful');
                        cache.put(event.request, res.clone());
                        // limitCache(activeCache.dynamic, 10)
                        return res;
                    })
                }).catch(err => {
                    //when user open page and haven't save in cache
                    return caches.match('/fallBack.html')
                })
            }
        }).catch((err) => {
            return fetch(event.request)
        })
    )

    ////2. Cache Only
    // event.respondWith(caches.match(event.request));

    ////3. Network Only
    // event.respondWith(fetch(event.request));

    ////4. first network second cache
    // event.respondWith(
    //     fetch(event.request).then((res) => {
    //         return caches.open(activeCache.dynamic).then((cache) => {
    //             console.log('cache dynamic open successful');
    //             cache.put(event.request, res.clone());
    //             return res;
    //         });
    //     }).catch((err) => {
    //         return caches.match(event.request)
    //     })
    // )

    ////5. some data from network, some data from cache
    // const urls = ['https://fakestoreapi.com/products?limit=4'];

    // if (urls.includes(event.request.url)) {
    //     event.respondWith(
    //         fetch(event.request).then(res => {
    //             const cloneRes = res.clone();
    //             cloneRes.json().then(data => {
    //                 for (let i in data) {
    //                     db.users.put(data[i])
    //                 }
    //             })
    //             return res;
    //         })
    //     )
    // } else {
    //     event.respondWith(
    //         caches.match(event.request).then((res) => {
    //             if (res) {
    //                 return res
    //             } else {
    //                 return fetch(event.request).then(res => {
    //                     return caches.open(activeCache.dynamic).then((cache) => {
    //                         console.log('cache dynamic open successful');
    //                         cache.put(event.request, res.clone());
    //                         // limitCache(activeCache.dynamic, 10)
    //                         return res;
    //                     })
    //                 }).catch(err => {
    //                     //when user open page and haven't save in cache
    //                     return caches.match('/fallBack.html')
    //                 })
    //             }
    //         }).catch((err) => {
    //             return fetch(event.request)
    //         })
    //     )
    // }
})

caches.keys().then((cacheNames) => {
    cacheNames.forEach(element => {
        console.log("cache match", caches.match(element));
    })
});

//limit size for cache
const limitCache = (key, size) => {
    caches.open(key).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > size) {
                cache.delete(keys[0]).then((deleted) => {
                    if (deleted) {
                        console.log("Oldest entry deleted successfully");
                    } else {
                        console.error("Failed to delete the oldest entry");
                    }
                }).catch((error) => {
                    console.error("Error deleting entry:", error);
                });
            }
        });
    });
}

// self.addEventListener('notificationclick', (event) => {
//     const action = event.action
//     const notification = event.notification
//     if (action === 'action1') {
//         alert('action1')
//     } else if (action === 'action2') {
//         alert('action2')
//     }
//     console.log('Notification clicked: ', event);
//     notification.close();
// })

// self.addEventListener('notificationclose', (event) => {
//     console.log('Notification closed: ', event);
// })

// self.addEventListener('push', (event) => {
//     console.log('Push received: ', event.data.text());
// })