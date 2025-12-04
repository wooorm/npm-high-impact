/* eslint-disable max-depth */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

/**
 * @typedef Package
 * @property {number} dependent_packages_count
 * @property {number} downloads
 * @property {string} name
 *
 * @typedef ResultDependentPackagesCount
 * @property {number} dependent_packages_count
 * @property {string} name
 *
 * @typedef ResultDownloads
 * @property {number} downloads
 * @property {string} name
 *
 * @typedef {ResultDependentPackagesCount | ResultDownloads} Result
 *
 * @typedef Search
 * @property {Exclude<keyof Package, 'name'>} field
 * @property {number} min
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

/** @type {ReadonlyArray<Search>} */
const searches = [
  {field: 'downloads', min: 1_000_000},
  {field: 'dependent_packages_count', min: 500}
]

for (const {field, min} of searches) {
  console.log('search for packages w/ `%s` more than `%s`', field, min)

  const stem = field.replaceAll('_', '-')

  /** @type {string | undefined} */
  let next =
    'https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages?' +
    new URLSearchParams({
      mailto: 'tituswormer@gmail.com',
      order: 'desc',
      page: '1',
      per_page: '400',
      sort: field
    })

  /** @type {Array<Result>} */
  const results = []
  let total = 0
  let chunks = 0

  while (next) {
    let rateLimitRemaining = Infinity
    /** @type {ReadonlyArray<Package> | undefined} */
    let maybeResult

    try {
      console.log('going to: %s', next)
      const response = await fetch(next)
      maybeResult = /** @type {ReadonlyArray<Package>} */ (
        await response.json()
      )

      const page = response.headers.get('current-page')
      assert.ok(page)
      const link = response.headers.get('link')
      next = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1]

      /** @type {number | undefined} */
      let lastValue

      for (const pkg of maybeResult) {
        const value = pkg[field]

        if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
          console.log(
            '  package `%s`: invalid value for field `%s` (`%s`), ignoring',
            pkg.name,
            field,
            value
          )
          continue
        }

        if (value < min) {
          console.log(
            '  package `%s`: value for field `%s` (`%s`) below minimum (`%s`), stopping',
            pkg.name,
            field,
            value,
            min
          )
          next = undefined
          break
        }

        lastValue = value
        results.push(
          field === 'dependent_packages_count'
            ? {dependent_packages_count: value, name: pkg.name}
            : {downloads: value, name: pkg.name}
        )
      }

      console.log(
        '%s page: %s; total: %s; last value: %s',
        field,
        page,
        results.length,
        lastValue
      )

      rateLimitRemaining = Number(
        response.headers.get('x-ratelimit-remaining') || '0'
      )
    } catch (error) {
      console.log('error %s, waiting 10m', error, maybeResult)
      await sleep(10 * 60 * 1000)
    }

    if (rateLimitRemaining < 1) {
      console.log('rate limit reached, waiting 10m')
      await sleep(10 * 60 * 1000)
    }

    // Avoid data loss and save memory.
    if (results.length > 10_000) {
      const basename = stem + '-' + chunks + '.json'
      await fs.writeFile(
        new URL('../data/' + basename, import.meta.url),
        JSON.stringify(results, undefined, 2) + '\n'
      )
      total += results.length
      console.log('saved %s (total %s)', basename, total)
      chunks++
      results.length = 0
    }
  }

  const basename = stem + '-' + chunks + '.json'
  await fs.writeFile(
    new URL('../data/' + basename, import.meta.url),
    JSON.stringify(results, undefined, 2) + '\n'
  )
  total += results.length
  console.log('saved %s (total %s)', basename, total)
  chunks++
  console.log('done! %s', total)
}

/**
 * @param {number} ms
 */
async function sleep(ms) {
  await new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
