import fs from 'node:fs/promises'

const min = 1_000_000

/** @type {Array<{name: string, downloads: number, ok: boolean}>} */
const downloads = JSON.parse(
  String(
    await fs.readFile(
      new URL('downloads-download-counts.json', import.meta.url)
    )
  )
)

/** @type {Array<{name: string, dependents: number}>} */
const dependent = JSON.parse(
  String(await fs.readFile(new URL('data-top-dependent.json', import.meta.url)))
)

const dependentTop = dependent.map((d) => d.name)

/** @type {Array<{name: string, downloads: number, ok: boolean}>} */
const top = []

downloads.forEach((d) => {
  const index = dependentTop.indexOf(d.name)
  let include = d.downloads >= min

  if (index !== -1) {
    include = true
    dependentTop.splice(index, 1)
  }

  if (include) {
    top.push(d)
  }
})

dependentTop.forEach((name) => {
  top.push({name, downloads: 0, ok: true})
})

const result = top
  .sort((a, b) => {
    return b.downloads - a.downloads
  })
  .map((d) => d.name)

await fs.writeFile(
  new URL('top.js', import.meta.url),
  'export const top = ' + JSON.stringify(result, null, 2) + '\n'
)
