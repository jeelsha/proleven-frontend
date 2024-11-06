export function aesEncrypt(text: string, key: string): string {
  const keyLength = 16; // AES-128
  const paddedKey = key.padEnd(keyLength, ' ');

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const encodedKey = encoder.encode(paddedKey);

  const encryptedData = [];
  for (let i = 0; i < data.length; i++) {
    encryptedData.push(data[i] ^ encodedKey[i % keyLength]); // eslint-disable-line no-bitwise
  }

  return btoa(String.fromCharCode(...encryptedData));
}

export function aesDecrypt(encryptedText: string, key: string): string {
  const keyLength = 16; // AES-128
  const paddedKey = key.padEnd(keyLength, ' ');

  const decoder = new TextDecoder();
  const data = new Uint8Array(
    atob(encryptedText)
      .split('')
      .map((char) => char.charCodeAt(0))
  );
  const encodedKey = new TextEncoder().encode(paddedKey);

  const decryptedData = [];
  for (let i = 0; i < data.length; i++) {
    decryptedData.push(data[i] ^ encodedKey[i % keyLength]); // eslint-disable-line no-bitwise
  }

  return decoder.decode(new Uint8Array(decryptedData));
}
