import { mkdir, readFile, writeFile } from 'node:fs/promises'

// The API client is generated from a committed snapshot of the backend's OpenAPI document, so
// builds and CI never need a running backend. Refresh the snapshot when the contract changes:
//   npm run api:pull                             (from the backend dev server)
//   npm run api:pull -- ../backend/openapi.json  (from a file)
const DEFAULT_SOURCE = 'http://localhost:3000/docs/json'
const target = new URL('../openapi/openapi.json', import.meta.url)

async function load(source: string): Promise<unknown> {
  if (!/^https?:\/\//.test(source)) return JSON.parse(await readFile(source, 'utf8'))

  const response = await fetch(source)
  if (!response.ok) throw new Error(`${source} answered ${response.status} ${response.statusText}`)
  return response.json()
}

const source = process.argv[2] ?? DEFAULT_SOURCE

try {
  const document = await load(source)
  if (typeof document !== 'object' || document === null || !('openapi' in document)) {
    throw new Error(`${source} is not an OpenAPI document`)
  }

  await mkdir(new URL('.', target), { recursive: true })
  // Same formatting as the backend's own openapi.json, so the two files can be diffed
  await writeFile(target, `${JSON.stringify(document, null, 2)}\n`)
  console.log(`openapi/openapi.json updated from ${source}`)
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error)
  console.error(`Couldn't load the OpenAPI document from ${source}: ${reason}`)
  console.error('Is the backend running (npm run dev)? Or pass a file: npm run api:pull -- <path>')
  process.exitCode = 1
}
