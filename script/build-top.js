/**
 * @typedef {import('./crawl-top-dependent.js').Result} DependentResult
 * @typedef {import('./crawl-top-download.js').Result} DownloadResult
 */

import fs from 'node:fs/promises'

/** @type {Array<DownloadResult>} */
const downloads = JSON.parse(
  String(
    await fs.readFile(new URL('../data/download-counts.json', import.meta.url))
  )
)

/** @type {Array<DependentResult>} */
const dependent = JSON.parse(
  String(
    await fs.readFile(new URL('../data/top-dependent.json', import.meta.url))
  )
)

const dependentTop = dependent.map((d) => d.name)

console.log('top (deps): %s', dependentTop.length)

/** @type {Array<DownloadResult>} */
const top = []

for (const d of downloads) {
  const index = dependentTop.indexOf(d.name)
  let include = d.downloads >= 1_000_000

  if (index !== -1) {
    include = true
    dependentTop.splice(index, 1)
  }

  if (include) {
    top.push(d)
  }
}

console.log('top (downloads): %s', top.length)

console.log('top due to deps, but not downloads: %s', dependentTop.length)

for (const name of dependentTop) {
  top.push({name, downloads: 0, ok: true})
}

top.sort((a, b) => b.downloads - a.downloads)

console.log('top (all): %s', top.length)

const result = top.map((d) => d.name)

await fs.writeFile(
  new URL('../lib/top.js', import.meta.url),
  'export const top = ' + JSON.stringify(result, null, 2) + '\n'
)
