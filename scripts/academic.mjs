import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const source = path.join(root, 'academic-site');
export const output = path.join(root, '.academic-build/site');
const generatedConfig = path.join(root, '.academic-build/paths.yml');

export function deploymentPaths(base = process.env.ASTRO_BASE_PATH || '/', site = process.env.ASTRO_SITE || 'http://127.0.0.1:4321') {
  const segments = base.trim().replace(/^\/+|\/+$/g, '');
  if (segments && !/^[\w./-]+$/.test(segments)) throw new Error('Invalid ASTRO_BASE_PATH');
  if (segments.split('/').some(part => part === '..' || part === '.')) throw new Error('Invalid base path segments');
  const home = segments ? `/${segments}/` : '/';
  return { home, academic: `${home}academic`, origin: new URL(site).origin };
}

function rubyExecutable() {
  if (process.env.RUBY_BIN) return process.env.RUBY_BIN;
  if (process.platform === 'win32') {
    for (const candidate of [
      path.join(process.env.LOCALAPPDATA || '', 'Programs/Ruby33-x64/bin/ruby.exe'),
      'C:/Ruby33-x64/bin/ruby.exe',
    ]) if (existsSync(candidate)) return candidate;
  }
  return 'ruby';
}

export function ruby(args, options = {}) {
  return new Promise((resolve, reject) => {
    const executable = rubyExecutable();
    const env = { ...process.env };
    if (path.isAbsolute(executable)) {
      const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
      env[pathKey] = path.dirname(executable) + path.delimiter + (env[pathKey] || '');
    }
    const child = spawn(executable, args, {
      cwd: source, stdio: 'inherit', windowsHide: true, env, ...options,
    });
    child.on('error', error => reject(new Error(`Ruby/Bundler unavailable: ${error.message}. Install Ruby 3.3, then run bundle install in academic-site/. Set RUBY_BIN if needed.`)));
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Jekyll exited with code ${code}`)));
  });
}

export async function buildAcademic(base, site) {
  const paths = deploymentPaths(base, site);
  await mkdir(path.dirname(generatedConfig), { recursive: true });
  await writeFile(generatedConfig, `url: ${JSON.stringify(paths.origin)}\nbaseurl: ${JSON.stringify(paths.academic)}\npersonal_home: ${JSON.stringify(paths.home)}\n`);
  await ruby(['-S', 'bundle', 'exec', 'jekyll', 'build', '--trace',
    '--source', source, '--destination', output,
    '--config', `${path.join(source, '_config.yml')},${generatedConfig}`]);
  await copyFile(path.join(source, 'LICENSE'), path.join(output, 'license.txt'));
  return paths;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildAcademic();
