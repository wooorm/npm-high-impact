/* eslint-disable no-await-in-loop */

/**
 * @import {ResultDownloads} from './crawl-packages.js'
 */

import fs from 'node:fs/promises'

/** @type {Array<ResultDownloads>} */
const data = []
let chunk = 0

while (true) {
  const basename = 'downloads-' + chunk + '.json'
  const file = new URL('../data/' + basename, import.meta.url)
  try {
    const chunkData = /** @type {Array<ResultDownloads>} */ (
      JSON.parse(String(await fs.readFile(file, 'utf8')))
    )
    data.push(...chunkData)
    console.log('loaded chunk %s, total %s', chunk, data.length)
    chunk++
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      console.log('no more chunks, exiting at %s', chunk)
      break
    }

    throw error
  }
}

// The data is already sorted on most-downloaded first.
const result = data.map((d) => d.name)

await fs.writeFile(
  new URL('../lib/top-download.js', import.meta.url),
  'export const topDownload = ' + JSON.stringify(result, undefined, 2) + '\n'
)
