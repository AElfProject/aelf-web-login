function addPrefixSuffix(str: string, chainId?: string) {
  if (!str) return str;
  let resStr = str.trim();
  const prefix = 'ELF_';
  const suffix = chainId ? `_${chainId}` : `_tDVW`;
  if (!str.startsWith(prefix)) {
    resStr = `${prefix}${resStr}`;
  }
  if (!str.endsWith(suffix)) {
    resStr = `${resStr}${suffix}`;
  }
  return resStr;
}

export { addPrefixSuffix };
