export function isPrivateKey(privateKey?: string) {
  try {
    if (privateKey && typeof privateKey === 'string') {
      return Uint8Array.from(Buffer.from(privateKey, 'hex')).length === 32;
    }
  } catch (error) {
    return false;
  }
  return false;
}
