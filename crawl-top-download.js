/**
 * @typedef {Record<string, NpmDownloadResult|null>} NpmDownloadBulkResult
 *
 * @typedef NpmDownloadResult
 * @property {number} downloads
 * @property {string} package
 * @property {string} start
 * @property {string} end
 *
 * @typedef NpmDownloadError
 * @property {string} error
 *
 * @typedef Result
 * @property {number} downloads
 * @property {string} name
 * @property {boolean} ok
 */

import fs from 'node:fs/promises'
import fetch from 'node-fetch'

// Get download counts:
// - https://github.com/npm/registry/blob/master/docs/download-counts.md#limits (see bulk)
// - https://api.npmjs.org/versions/vendors/last-week (example)
// - more info on API: https://github.com/unifiedjs/npm-tools/blob/main/npm.md#get-a-package.
//   - https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#get-v1search

let slice = 0
const size = 128
const destination = new URL('data-download-counts.json', import.meta.url)
const allTheNames = [
  'remark',
  '@types/mdast',
  '@wooorm/starry-night',
  'vendors',
  '@asd/4awztrdxtghkjkfcydugvkbln'
]
/** @type {Array<string>} */
const unscoped = []
/** @type {Array<string>} */
const scoped = []

for (const name of allTheNames) {
  if (name.charAt(0) === '@') {
    scoped.push(name)
  } else {
    unscoped.push(name)
  }
}

/** @type {Array<Result>} */
const allResults = []

console.log('First fetching %s unscoped packages in bulk', unscoped.length)

// eslint-disable-next-line no-constant-condition
while (true) {
  const names = unscoped.slice(slice * size, (slice + 1) * size)

  if (names.length === 0) {
    break
  }

  console.log(
    'fetching page: %s, collected total: %s',
    slice,
    allResults.length
  )

  const url = new URL(
    'https://api.npmjs.org/downloads/point/last-week/' +
      names.map((d) => encodeURIComponent(d)).join(',')
  )

  /* eslint-disable no-await-in-loop */
  const response = await fetch(String(url))
  const results = /** @type {NpmDownloadBulkResult} */ (await response.json())
  /* eslint-enable no-await-in-loop */

  /** @type {Array<Result>} */
  const clean = []
  /** @type {string} */
  let key

  for (key in results) {
    if (Object.hasOwn(results, key)) {
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

console.log('Now fetching %s scoped packages', scoped.length)

let index = -1

while (++index < scoped.length) {
  const name = scoped[index]

  const url = new URL(
    'https://api.npmjs.org/downloads/point/last-week/' +
      encodeURIComponent(name)
  )
  /* eslint-disable no-await-in-loop */
  const response = await fetch(String(url))
  const result = /** @type {NpmDownloadResult|NpmDownloadError} */ (
    await response.json()
  )
  /* eslint-enable no-await-in-loop */

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

  if (index !== 0 && index % 10 === 0) {
    console.log('at: %s, last: %j', index, clean)

    // Intermediate writes to help debugging and seeing some results early.
    setTimeout(async () => {
      await fs.writeFile(
        destination,
        JSON.stringify(allResults, null, 2) + '\n'
      )
    })
  }

  allResults.push(clean)
}

await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')

console.log('done!')
