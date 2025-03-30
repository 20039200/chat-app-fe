const DB_NAME = "ChatAppDB";
const STORE_NAME = "keys";

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Failed to open IndexedDB");
    });
}

// Store Private Key
export async function storePrivateKey(id, privateKey) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, privateKey });

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve("Private key stored");
        tx.onerror = () => reject("Error storing private key");
    });
}

// Retrieve Private Key
export async function getPrivateKey(id) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.privateKey || null);
        request.onerror = () => reject("Error retrieving private key");
    });
}
