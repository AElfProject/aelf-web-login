function getOriginalAddress(address: string) {
  if (!address) return '-';
  if (typeof address !== 'string') {
    return '-';
  }
  return address.replace(/^ELF_/, '').replace(/_.*$/, '');
}

export { getOriginalAddress };
