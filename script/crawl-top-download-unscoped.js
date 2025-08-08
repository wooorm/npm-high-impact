/**
 * @import {Response} from 'undici'
 * @import {DownloadTail} from './crawl-top-tools.js'
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
import {configure, resume, argv} from './crawl-top-tools.js'

const maxsize = 128 // Up to 128 at a time are allowed.
const destination = new URL(
  '../data/download-counts-unscoped.json',
  import.meta.url
)

let size = maxsize // We start with 128, and reduce if needed.
let slice = 0
let start = 0
let errorless = 0

const input = new URL('../data/packages.txt', import.meta.url)
const allTheNames = String(await fs.readFile(input)).split('\n')

/** @type {{last?: DownloadTail, lastpath: URL}} */
const {last, lastpath} = await resume({type: 'unscoped'})
let caughtUp = !last
if (last) {
  console.log('Resume from last package: %s', last.name)
}

/** @type {Array<string>} */
const unscoped = []
for (const name of allTheNames) {
  if (!caughtUp) {
    caughtUp = name === last?.name
    continue
  }

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

// Configure undici to for production use
configure()

while (true) {
  const names = unscoped.slice(start, start + size)
  console.log(
    'fetching unscoped page: %s { start: %s, size: %s } collected total: %s',
    slice,
    start,
    size,
    allResults.length
  )

  const encoded = names.map((d) => encodeURIComponent(d)).join(',')
  if (encoded.length > 12_000) {
    console.warn('Encoded names length too long: %s', encoded.length)
    console.warn('Reducing size from %s to %s', size, size / 2)
    size = Math.floor(size / 2)
    errorless = 0
    continue
  } else if (size < maxsize && errorless > 10) {
    console.warn('Increase { size: %s } to maxsize { size: %s }', size, maxsize)
    size = maxsize
  }

  if (names.length === 0) {
    break
  }

  const url = new URL(
    `https://api.npmjs.org/downloads/point/${argv.time}/${encoded}`
  )

  /* eslint-disable no-await-in-loop */
  /** @type {Response | undefined} */
  let response
  /** @type {String} */
  let text
  /** @type {NpmDownloadBulkResult} */
  let results

  try {
    response = await fetch(String(url))
    text = await response.text()
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

  try {
    results = JSON.parse(text)
  } catch (error) {
    // Remark (0): we should probably check the response headers for non-JSON
    // which indicates we are being rate-limited.
    console.error('Error parsing JSON for %s: %s', names.join(','), error)
    console.error('Response text: %s', text)
    throw new Error(`Failed to parse JSON for ${names.join(',')}: ${error}`)
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
    await fs.writeFile(lastpath, JSON.stringify(tail, null, 2) + '\n')
  })

  start += size
  slice++
  errorless++
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
