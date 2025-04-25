/**
 * @import {Response} from 'undici'
 */

/**
 * @typedef {Record<string, NpmDownloadResult | null>} NpmDownloadBulkResult
 *
 * @typedef NpmDownloadResult
 * @property {number} downloads
 * @property {string} package
 * @property {string} start
 * @property {string} end
 *
 * @typedef Result
 * @property {number} downloads
 * @property {string} name
 * @property {boolean} ok
 */

import fs from 'node:fs/promises'
import {fetch} from 'undici'
import {minimist} from 'minimist'

const argv = minimist(process.argv.slice(2), {
  default: { time: 'last-week' }
});


let slice = 0
const size = 128 // Up to 128 at a time are allowed.
const destination = new URL(
  '../data/download-counts-unscoped.json',
  import.meta.url
)
const input = new URL('../data/packages.txt', import.meta.url)
const allTheNames = String(await fs.readFile(input)).split('\n')
/** @type {Array<string>} */
const unscoped = []

for (const name of allTheNames) {
  if (name.charAt(0) !== '@') {
    unscoped.push(name)
  }
}

/** @type {Array<Result>} */
const allResults = []

let previousFailed = false

console.log(
  'Fetching %s unscoped packages in bulk (this’ll take about 12 hours)',
  unscoped.length
)

while (true) {
  const names = unscoped.slice(slice * size, (slice + 1) * size)

  if (names.length === 0) {
    break
  }

  console.log(
    'fetching unscoped page: %s, collected total: %s',
    slice,
    allResults.length
  )

  const url = new URL(
    'https://api.npmjs.org/downloads/point/' +
      `${argv.time}/` +
      names.map((d) => encodeURIComponent(d)).join(',')
  )

  /* eslint-disable no-await-in-loop */
  /** @type {Response | undefined} */
  let response
  /** @type {NpmDownloadBulkResult} */
  let results

  try {
    response = await fetch(String(url))
    results = /** @type {NpmDownloadBulkResult} */ (await response.json())
  } catch (error) {
    console.log('errrror:', response, url)
    console.log(error)

    if (previousFailed) {
      previousFailed = false
      slice++
      console.log('dropping chunk that keeps failing (%s: %j)…', slice, names)
    } else {
      console.log('sleeping for 10s…')
      await sleep(10 * 1000)
      previousFailed = true
    }

    continue
  }

  previousFailed = false

  /* eslint-enable no-await-in-loop */

  /** @type {Array<Result>} */
  const clean = []
  /** @type {string} */
  let key

  for (key in results) {
    if (Object.hasOwn(results, key)) {
      // “Thing”s might not be packages, in which case they are set to `null`.
      const value = results[key]
      if (value) {
        clean.push({
          downloads: value.downloads,
          name: value.package,
          ok: true
        })
      } else {
        clean.push({
          downloads: 0,
          name: key,
          ok: false
        })
      }
    }
  }

  const tail = clean[clean.length - 1]
  if (tail) {
    console.log('  last: %j', tail)
  }

  allResults.push(...clean)

  // Intermediate writes to help debugging and seeing some results early.
  setTimeout(async () => {
    await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')
  })

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
