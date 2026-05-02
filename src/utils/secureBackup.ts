const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

const fromBase64 = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const saltBuffer = salt.slice().buffer as ArrayBuffer
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 250000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export type EncryptedBackupPayload = {
  version: 1
  algorithm: 'AES-GCM'
  kdf: 'PBKDF2'
  iterations: number
  createdAt: string
  salt: string
  iv: string
  ciphertext: string
}

export const encryptBackup = async (plainText: string, passphrase: string): Promise<EncryptedBackupPayload> => {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plainText))

  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2',
    iterations: 250000,
    createdAt: new Date().toISOString(),
    salt: toBase64(salt.buffer),
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(cipherBuffer),
  }
}

export const decryptBackup = async (payloadText: string, passphrase: string) => {
  const payload = JSON.parse(payloadText) as EncryptedBackupPayload

  if (!payload.ciphertext || !payload.iv || !payload.salt) {
    throw new Error('This backup file is not a valid encrypted export.')
  }

  const salt = fromBase64(payload.salt)
  const iv = fromBase64(payload.iv)
  const ciphertext = fromBase64(payload.ciphertext)
  const key = await deriveKey(passphrase, salt)

  const plainBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv.slice().buffer as ArrayBuffer,
    },
    key,
    ciphertext.slice().buffer as ArrayBuffer,
  )

  return decoder.decode(plainBuffer)
}
