/**
 * @typedef {import('./crawl-top-download.js').Result} Result
 */

import fs from 'node:fs/promises'

/** @type {Array<Result>} */
const data = JSON.parse(
  String(
    await fs.readFile(new URL('../data/download-counts.json', import.meta.url))
  )
)

const result = data
  .filter((d) => d.ok && d.downloads >= 1_000_000)
  .sort((a, b) => b.downloads - a.downloads)
  .map((d) => d.name)

await fs.writeFile(
  new URL('../lib/top-download.js', import.meta.url),
  'export const topDownload = ' + JSON.stringify(result, null, 2) + '\n'
)
