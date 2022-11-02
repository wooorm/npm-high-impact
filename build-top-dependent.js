import fs from 'node:fs/promises'

/** @type {Array<{name: string, dependents: number}>} */
const data = JSON.parse(
  String(await fs.readFile(new URL('data-top-dependent.json', import.meta.url)))
)

// The data is already sorted on most-dependent-on first.
const result = data.map((d) => d.name)

await fs.writeFile(
  new URL('top-dependent.js', import.meta.url),
  'export const topDependent = ' + JSON.stringify(result, null, 2) + '\n'
)
