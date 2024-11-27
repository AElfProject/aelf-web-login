import { resolve } from 'path';
// relative path is still required here before aliases are enabled
import baseTSConfig from '../../tsconfig.base.json';

export const getTSConfigPaths = () => {
  const aliases: Record<string, string> = {};
  for (const [key, value] of Object.entries<string[]>(baseTSConfig.compilerOptions.paths)) {
    aliases[key] = resolve(__dirname, value[0]);
  }
  return aliases;
};

export default {};
