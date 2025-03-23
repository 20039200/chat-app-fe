import CryptoJS from 'crypto-js';

// Generate AES key for each message
export function generateAESKey() {
  return CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key
}

// Encrypt message with AES-256
export function encryptMessage(message, aesKey) {
  // const iv = CryptoJS.lib.WordArray.random(16); // Random IV
  const encrypted = CryptoJS.AES.encrypt(message, aesKey).toString();
  return { encrypted };
}

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Encrypt AES key using the receiver's public key (RSA)
export async function encryptAESKey(aesKey, publicKeyBase64) {
  try {
    // Convert Base64 public key to ArrayBuffer
    const publicKeyArrayBuffer = base64ToArrayBuffer(publicKeyBase64);

    // Import the RSA Public Key
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyArrayBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );

    // Encrypt the AES Key
    const encryptedAESKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      new TextEncoder().encode(aesKey)
    );

    // Convert to Base64 for easy storage/transmission
    return btoa(String.fromCharCode(...new Uint8Array(encryptedAESKey)));
  } catch (error) {
    console.error("Error encrypting AES key:", error);
    throw error;
  }
}
