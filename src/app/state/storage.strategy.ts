import { StateStorage } from '@ngneat/elf-persist-state/src/lib/storage';

export class StorageStrategy implements StateStorage {
  setItem: (key: string, value: Record<string, any>) => Promise<void>;
  getItem: <T extends Record<string, any>>(key: string) => Promise<T | null | undefined>

  constructor(private readonly params: { password: string }) {
    this.setItem = async (key: string, value: Record<string, any>): Promise<void> => {
      const encryptedData = await this.encrypt(JSON.stringify(value), params.password);
      window.localStorage.setItem(key, JSON.stringify(encryptedData));
    }

    this.getItem = async <T extends Record<string, any>>(key: string): Promise<T | null | undefined> => {
      const savedValue = window.localStorage.getItem(key);
      if (!savedValue) return null;
      const encryptedData = JSON.parse(savedValue);
      const decryptedData = await this.decrypt(encryptedData, params.password);
      return JSON.parse(decryptedData);
    }
  }

  async removeItem(key: string): Promise<boolean | void> {
    window.localStorage.removeItem(key);
  }

  async encrypt(json: string, password: string ) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.getKey(password, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const contentBytes = this.stringToBytes(json);
    const cipher = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, contentBytes)
    );
    return {
      salt: this.bytesToBase64(salt),
      iv: this.bytesToBase64(iv),
      cipher: this.bytesToBase64(cipher),
    };
  }

  async getKey(password: string, salt: Uint8Array) {
    const passwordBytes = this.stringToBytes(password);

    const initialKey = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      initialKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async decrypt(encryptedData: { salt: string; iv: string; cipher: string }, password: string) {
    const salt = this.base64ToBytes(encryptedData.salt);
    const key = await this.getKey(password, salt);
    const iv = this.base64ToBytes(encryptedData.iv);
    const cipher = this.base64ToBytes(encryptedData.cipher);
    const contentBytes = new Uint8Array(
      await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher)
    );
    return this.bytesToString(contentBytes);
  }

  stringToBytes(str: string) {
    return new TextEncoder().encode(str);
  }

  bytesToString(bytes: Uint8Array) {
    return new TextDecoder().decode(bytes);
  }

  bytesToBase64(arr: Uint8Array) {
    return btoa(Array.from(arr, (b) => String.fromCharCode(b)).join(""));
  }

  base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }
}
