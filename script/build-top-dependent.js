/* eslint-disable no-await-in-loop */

/**
 * @import {ResultDependentPackagesCount} from './crawl-packages.js'
 */

import fs from 'node:fs/promises'

/** @type {Array<ResultDependentPackagesCount>} */
const data = []
let chunk = 0

while (true) {
  const basename = 'dependent-packages-count-' + chunk + '.json'
  const file = new URL('../data/' + basename, import.meta.url)
  try {
    const chunkData = /** @type {Array<ResultDependentPackagesCount>} */ (
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

// The data is already sorted on most-depended-on first.
const result = data.map((d) => d.name)

await fs.writeFile(
  new URL('../lib/top-dependent.js', import.meta.url),
  'export const topDependent = ' + JSON.stringify(result, undefined, 2) + '\n'
)
