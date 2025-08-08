import process from 'node:process'
import fs from 'node:fs/promises'
import {parseArgs} from 'node:util'
import {Agent, interceptors, setGlobalDispatcher} from 'undici'

/**
 * @typedef {Object} DownloadTail
 * @property {string} name
 * @property {number} downloads
 * @property {boolean} ok
 */

const {values} = parseArgs({
  args: process.argv.slice(2),
  options: {
    time: {
      type: 'string',
      default: 'last-week'
    },
    min: {
      type: 'string',
      default: '500'
    }
  },
  strict: false
})

export const argv = {
  time: values.time || 'last-week',
  min: Number(values.min) || 500
}

export function configure() {
  // Interceptors to add response caching, DNS caching and retrying to the dispatcher
  const {cache, dns, retry} = interceptors

  const defaultDispatcher = new Agent({
    connections: 100, // Limit concurrent kept-alive connections to not run out of resources
    headersTimeout: 10_000, // 10 seconds; set as appropriate for the remote servers you plan to connect to
    bodyTimeout: 10_000
  }).compose(cache(), dns(), retry())

  setGlobalDispatcher(defaultDispatcher) // Add these interceptors to all `fetch` and Undici `request` calls
}

/**
 * @param {{type?: string}} options
 * @returns {Promise<{last: DownloadTail, lastpath: URL} | {lastpath: URL}>}
 */
export async function resume({type = 'scoped'}) {
  const lastpath = new URL(
    `../data/download-counts-${type}.last.json`,
    import.meta.url
  )

  try {
    /** @type {DownloadTail} */
    const last = JSON.parse(String(await fs.readFile(lastpath)))
    return {
      last,
      lastpath
    }
  } catch (error) {
    if (isNodeError(error) && error.code !== 'ENOENT') {
      console.warn(
        '[%s] Error reading %s: %s',
        error.code,
        lastpath,
        error.message
      )
    }

    return {lastpath}
  }
}

/**
 * @param {unknown} error
 * @returns {error is Error & {code?: string}}
 */
export function isNodeError(error) {
  return error instanceof Error && 'code' in error
}
