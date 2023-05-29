/**
 * @typedef {import('./crawl-top-download-unscoped.js').Result} Result
 * @typedef {import('./crawl-top-download-unscoped.js').NpmDownloadResult} NpmDownloadResult
 *
 * @typedef NpmDownloadError
 * @property {string} error
 */

import fs from 'node:fs/promises'
import {fetch} from 'undici'

let slice = 0
const destination = new URL(
  '../data/download-counts-scoped.json',
  import.meta.url
)
const input = new URL('../data/packages.txt', import.meta.url)
const allTheNames = String(await fs.readFile(input)).split('\n')
/** @type {Array<string>} */
const scoped = []

for (const name of allTheNames) {
  if (name.charAt(0) === '@') {
    scoped.push(name)
  }
}

/** @type {Array<Result>} */
const allResults = []

console.log(
  'Fetching %s scoped packages (this’ll take about 9 hours)',
  scoped.length
)

// 32 gets rate-limited by npm.
const scopedSize = 24
slice = 0

// eslint-disable-next-line no-constant-condition
while (true) {
  const names = scoped.slice(slice * scopedSize, (slice + 1) * scopedSize)

  if (names.length === 0) {
    break
  }

  console.log(
    'fetching scoped page: %s, collected total: %s',
    slice,
    allResults.length
  )

  const promises = names.map(async (name) => {
    const url = new URL(
      'https://api.npmjs.org/downloads/point/last-week/' +
        encodeURIComponent(name)
    )
    const response = await fetch(String(url))
    const result = /** @type {NpmDownloadResult | NpmDownloadError} */ (
      await response.json()
    )

    /** @type {Result} */
    const clean =
      'error' in result
        ? {
            downloads: 0,
            name,
            ok: false
          }
        : {
            downloads: result.downloads,
            name: result.package,
            ok: true
          }

    return clean
  })

  /** @type {Array<Result>} */
  let cleanResults

  /* eslint-disable no-await-in-loop */
  try {
    cleanResults = await Promise.all(promises)
  } catch (error) {
    console.log(error)
    console.log('sleeping for 10s…')
    await sleep(10 * 1000)
    continue
  }
  /* eslint-enable no-await-in-loop */

  allResults.push(...cleanResults)

  // Intermediate writes to help debugging and seeing some results early.
  setTimeout(async () => {
    await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')
  })

  const tail = allResults[allResults.length - 1]
  if (tail) {
    console.log('  last: %j', tail)
  }

  slice++
}

await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')

console.log('done!')

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}
