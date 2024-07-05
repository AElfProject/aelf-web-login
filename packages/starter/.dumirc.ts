import { readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { defineConfig } from 'dumi';
import { glob, Glob, globStream, globStreamSync, globSync } from 'glob';

const packagePath = join(__dirname, '../../packages');
const createAlias = () => {
  const jsonFilePath = globSync(join(packagePath, '/**/*/package.json'), {
    ignore: join(packagePath, '/**/*/node_modules/**/*/package.json'),
  });
  return jsonFilePath
    .map((filePath) => {
      const dirPath = dirname(filePath);
      const sourceCodePath = join(dirPath, 'src');
      const pkgJSON = require(filePath);
      console.log('find: \x1b[32m%s\x1b[0m at %s', pkgJSON.name, dirPath);

      return {
        name: pkgJSON.name,
        path: sourceCodePath,
      };
    })
    .reduce(
      (pre, pkg) => {
        pre[pkg.name] = pkg.path;
        return {
          ...pre,
        };
      },
      { 'aelf-design': resolve(__dirname, 'node_modules/aelf-design') } as Record<string, string>,
    );
};

const alias = createAlias();

export default defineConfig({
  alias,
  outputPath: 'docs-dist',
  themeConfig: {
    logo: 'https://ipfs.io/ipfs/QmWtjvb47DU1EQ4MpridFY1ow4214aAWCkhGu3ZF4xvRSY/',
    socialLinks: {
      github: 'https://github.com/AElfProject/aelf-web-login',
    },
  },
  favicons: ['https://ipfs.io/ipfs/QmWtjvb47DU1EQ4MpridFY1ow4214aAWCkhGu3ZF4xvRSY/'],
  locales: [{ id: 'en-US', name: 'EN' }],
});
