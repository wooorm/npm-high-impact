/**
 * @typedef LibrariesIOSearchResult
 * @property {number} dependent_repos_count
 * @property {number} dependents_count
 * @property {unknown} deprecation_reason
 * @property {string} description
 * @property {number} forks
 * @property {unknown} homepage
 * @property {Array<string>} keywords
 * @property {unknown} language
 * @property {string} latest_download_url
 * @property {string} latest_release_number
 * @property {string} latest_release_published_at
 * @property {string} latest_stable_release_number
 * @property {string} latest_stable_release_published_at
 * @property {unknown} license_normalized
 * @property {unknown} licenses
 * @property {string} name
 * @property {Array<unknown>} normalized_licenses
 * @property {string} package_manager_url
 * @property {unknown} platform
 * @property {number} rank
 * @property {unknown} repository_license
 * @property {string} repository_url
 * @property {number} stars
 * @property {unknown} status
 * @property {Array<unknown>} versions
 *
 * @typedef Result
 * @property {number} dependents
 * @property {string} name
 */

import fs from 'node:fs/promises'
import process from 'node:process'
import {fetch} from 'undici'
import dotenv from 'dotenv'
import {argv} from './crawl-top-tools.js'

dotenv.config()

const key = process.env.LIO_TOKEN

if (!key) {
  throw new Error(
    'Missing `LIO_TOKEN` (Libraries IO token) in env, please add a `.env` file with it'
  )
}

// Stop when packages are depended on by less than this number of packages.
const {min} = argv
const destination = new URL('../data/top-dependent.json', import.meta.url)
let page = 0 // First page is `1`.

/** @type {Array<Result>} */
const allResults = []

while (true) {
  page++
  console.log('fetching page: %s, collected total: %s', page, allResults.length)

  const url = new URL('https://libraries.io/api/search')
  url.searchParams.append('platforms', 'npm')
  url.searchParams.append('sort', 'dependents_count')
  url.searchParams.append('order', 'desc')
  url.searchParams.append('per_page', '100')
  url.searchParams.append('page', String(page))
  url.searchParams.append('api_key', key)

  /* eslint-disable no-await-in-loop */
  const response = await fetch(String(url))
  const results = /** @type {Array<LibrariesIOSearchResult>} */ (
    await response.json()
  )
  /* eslint-enable no-await-in-loop */

  const clean = results
    .map(function (d) {
      /** @type {Result} */
      const result = {
        name: d.name,
        dependents: d.dependents_count
      }

      return result
    })
    .filter(function (d) {
      return d.dependents >= min
    })

  const tail = clean[clean.length - 1]
  if (tail) {
    console.log('  last: %j', tail)
  }

  allResults.push(...clean)

  if (clean.length < results.length) {
    break
  }

  // Intermediate writes to help debugging and seeing some results early.
  setTimeout(async () => {
    await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')
  })
}

await fs.writeFile(destination, JSON.stringify(allResults, null, 2) + '\n')

console.log('done!')
