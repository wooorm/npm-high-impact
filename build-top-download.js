import fs from 'node:fs/promises'

const min = 1_000_000

/** @type {Array<{name: string, downloads: number, ok: boolean}>} */
const data = JSON.parse(
  String(
    await fs.readFile(new URL('data-download-counts.json', import.meta.url))
  )
)

const result = data
  .filter((d) => d.ok && d.downloads >= min)
  .sort((a, b) => {
    return b.downloads - a.downloads
  })
  .map((d) => d.name)

await fs.writeFile(
  new URL('top-download.js', import.meta.url),
  'export const topDownload = ' + JSON.stringify(result, null, 2) + '\n'
)
