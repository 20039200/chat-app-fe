import CryptoJS from 'crypto-js';

// Convert PEM (Base64 string) to ArrayBuffer
function pemToArrayBuffer(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

// Decrypt AES Key using RSA Private Key
async function decryptAESKey(encryptedAESKey, privateKeyB64) {
  try {
    const privateKeyBuffer = pemToArrayBuffer(privateKeyB64); // Convert to ArrayBuffer

    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );

    const decryptedAESKey = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      new Uint8Array(atob(encryptedAESKey).split('').map(c => c.charCodeAt(0)))
    );

    return new TextDecoder().decode(decryptedAESKey);
  } catch (error) {
    console.error("Error decrypting AES key:", error);
    return null;
  }
}

// Decrypt Message using AES Key
function decryptMessage(encryptedMessage, aesKey) {
  return CryptoJS.AES.decrypt(encryptedMessage, aesKey).toString(CryptoJS.enc.Utf8);
}

// Receive & Decrypt Message
export async function receiveMessage(messageData, userId, privateKey) {
  const aesKey = await decryptAESKey(userId === messageData.receiverId ? messageData.encryptedAESKeyReceiver : messageData.encryptedAESKeySender, privateKey);
  if (!aesKey) return "Decryption failed"; // Handle error case
  return decryptMessage(messageData.encryptedMessage, aesKey);
}
