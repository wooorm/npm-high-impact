/**
 * @typedef {import('./crawl-top-download-scoped.js').Result} Result
 */

import fs from 'node:fs/promises'

/** @type {Array<Result>} */
const dataUnscoped = JSON.parse(
  String(
    await fs.readFile(
      new URL('../data/download-counts-unscoped.json', import.meta.url)
    )
  )
)

/** @type {Array<Result>} */
const dataScoped = JSON.parse(
  String(
    await fs.readFile(
      new URL('../data/download-counts-scoped.json', import.meta.url)
    )
  )
)

const result = [...dataScoped, ...dataUnscoped]
  .filter((d) => d.ok && d.downloads >= 1_000_000)
  .sort((a, b) => b.downloads - a.downloads)
  .map((d) => d.name)

await fs.writeFile(
  new URL('../lib/top-download.js', import.meta.url),
  'export const topDownload = ' + JSON.stringify(result, null, 2) + '\n'
)
