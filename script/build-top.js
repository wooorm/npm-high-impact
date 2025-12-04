import fs from 'node:fs/promises'
import {topDependent} from '../lib/top-dependent.js'
import {topDownload} from '../lib/top-download.js'

const result = [...new Set([...topDownload, ...topDependent])]

await fs.writeFile(
  new URL('../lib/top.js', import.meta.url),
  'export const top = ' + JSON.stringify(result, null, 2) + '\n'
)
