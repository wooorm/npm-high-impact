/**
 * @import {NpmDownloadResult, Result} from './crawl-top-download-unscoped.js'
 */

/**
 * @typedef NpmDownloadError
 * @property {string} error
 */

import fs from 'node:fs/promises'
import {configure,resume,argv} from './crawl-top-tools.js'

let slice = 0
const destination = new URL(
  '../data/download-counts-scoped.json',
  import.meta.url
)
const input = new URL('../data/packages.txt', import.meta.url)
const allTheNames = String(await fs.readFile(input)).split('\n')

const { last, lastpath } = await resume({ type: 'scoped' })
let caughtUp = !last
if (last) {
  console.log('Resume from last package: %s', last.name)
}

/** @type {Array<string>} */
const scoped = []
for (const name of allTheNames) {
  if (!caughtUp) {
    caughtUp = name === last.name
    continue;
  }

  if (name.charAt(0) === '@') {
    scoped.push(name)
  }
}

if (!scoped.length) {
  if (last) console.log('No scoped packages found after %s', last.name)
  process.exit(0);
}

/** @type {Array<Result>} */
const allResults = []

console.log(
  'Fetching %s scoped packages (this’ll take about 9 hours)',
  scoped.length
)

// Configure undici to for production use
configure()

// 32 gets rate-limited by npm.
const scopedSize = 24
slice = 0

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
      'https://api.npmjs.org/downloads/point/' +
        `${argv.time}/` +
        encodeURIComponent(name)
    )
    const response = await fetch(String(url))
    const text = (
      await response.text()
    )

    /** @type {NpmDownloadResult | NpmDownloadError} */
    let result
    try {
      result = JSON.parse(text)
    } catch (error) {
      // Remark (0): we should probably check the response headers for non-JSON
      // which indicates we are being rate-limited.
      console.error('Error parsing JSON for %s: %s', name, error)
      console.error('Response text: %s', text)
      process.exit(1)
    }

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

  const tail = allResults[allResults.length - 1]
  if (tail) {
    console.log('  last: %j', tail)
  }

  // Intermediate writes to help debugging and seeing some results early.
  setTimeout(async () => {
    await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')
    await fs.writeFile(lastpath, JSON.stringify(tail, null, 2) + '\n')
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
