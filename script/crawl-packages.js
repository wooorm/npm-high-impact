/**
 * @typedef {import('node:stream').Readable} Readable
 *
 * @typedef Database
 * @property {number} update_seq
 *
 * @typedef Change
 *   Change.
 * @property {number} seq
 *   Change sequence.
 * @property {string} id
 *   Package name.
 */

import defaultFs, {promises as fs} from 'node:fs'
import process from 'node:process'
import {fetch} from 'undici'
// @ts-expect-error: untyped.
import ChangesStream from 'changes-stream'

// The npm database.
const db = 'https://replicate.npmjs.com'

let start = 0
let current = 0

try {
  start = Number.parseInt(
    String(await fs.readFile(new URL('../data/sequence.txt', import.meta.url))),
    10
  )
} catch {}

console.log('starting at: %s', start)

/** @type {Set<string>} */
let set = new Set()

try {
  set = new Set(
    String(
      await fs.readFile(new URL('../data/packages.txt', import.meta.url))
    ).split('\n')
  )
} catch {}

const dbResponse = await fetch(db)
const dbResult = /** @type {Database} */ (await dbResponse.json())
const end = dbResult.update_seq
console.log('ending at: %s', end)

process.on('exit', teardown)
process.on('SIGINT', teardown)

/** @type {Readable} */
const stream = new ChangesStream({since: start, db})

stream.on('data', function (/** @type {Change} */ change) {
  current = change.seq

  if (current < end) {
    const rest = end - current
    const progress = ((1 - rest / end) * 100).toFixed(3)
    console.log('%s (%s%) seq:%s', rest, progress, current)
    set.add(change.id)
  } else {
    console.log('done! seq: %s, end: %s', current, end)
    teardown()
  }
})

function teardown() {
  console.log('teardown at %s (seq: %s, end: %s)', set.size, current, end)
  defaultFs.writeFileSync(
    new URL('../data/packages.txt', import.meta.url),
    [...set].join('\n')
  )
  defaultFs.writeFileSync(
    new URL('../data/sequence.txt', import.meta.url),
    String(current)
  )
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit()
}
