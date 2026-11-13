import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const directory = await mkdtemp(join(tmpdir(), 'le-matin-tests-'))
try {
  const outfile = join(directory, 'settings.mjs')
  await build({ entryPoints: ['tests/settings.test.ts'], bundle: true, platform: 'node', format: 'esm', outfile, define: { 'import.meta.env': '{}' } })
  const storage = new Map()
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
  await import(pathToFileURL(outfile).href)
} finally { await rm(directory, { recursive: true, force: true }) }
