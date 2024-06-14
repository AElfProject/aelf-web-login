function addPrefixSuffix(str: string, chainId = 'tDVW') {
  if (!str) return str;
  let resStr = str.trim();
  const prefix = 'ELF_';
  const suffix = `_${chainId}`;
  if (!str.startsWith(prefix)) {
    resStr = `${prefix}${resStr}`;
  }
  if (!str.endsWith(suffix)) {
    resStr = `${resStr}${suffix}`;
  }
  return resStr;
}

export { addPrefixSuffix };
