# npm-high-impact

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

The high-impact (popular) packages of npm.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`npmHighImpact`](#npmhighimpact)
  * [`npmTopDependents`](#npmtopdependents)
  * [`npmTopDownloads`](#npmtopdownloads)
* [Data](#data)
* [Scripts](#scripts)
* [Types](#types)
* [Compatibility](#compatibility)
* [Related](#related)
* [Contribute](#contribute)
* [Security](#security)
* [License](#license)

## What is this?

This package exposes the names of popular packages on the public npm registry.
The definition of the term *popular* here is the same as what npm itself calls
*high-impact*.
They classify packages as having a high impact on the ecosystem when a package
meets one or more of the following conditions:

* download count of 1 000 000 or more per week
* depended on by 500 or more other packages

## When should I use this?

Please use this for fun experiments when researching the npm registry.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 16+),
install with [npm][npmjs-install]:

```sh
npm install npm-high-impact
```

In Deno with [`esm.sh`][esmsh]:

```js
import {npmHighImpact} from 'https://esm.sh/npm-high-impact@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {npmHighImpact} from 'https://esm.sh/npm-high-impact@1?bundle'
</script>
```

## Use

```js
import {npmHighImpact} from 'npm-high-impact'

console.log(npmHighImpact.length)
console.log(npmHighImpact)
```

```js
15113
[
  'semver',
  'ansi-styles',
  'debug',
  'chalk',
  'minimatch',
  'supports-color',
  'strip-ansi',
  'ms',
  'ansi-regex',
  'string-width',
  // …
]
```

## API

This package exports the identifiers [`npmHighImpact`][api-npm-high-impact],
[`npmTopDependents`][api-npm-top-dependents],
and [`npmTopDownloads`][api-npm-top-downloads].
There is no default export.

### `npmHighImpact`

List of top package names (`Array<string>`).

Sorted by most downloaded first.
Packages that don’t reach the download threshold but are depended on a lot are
listed after that in order of dependents.
Includes (unique) packages from `npmTopDependents` and `npmTopDownloads`.

### `npmTopDependents`

List of package names that are depended on a lot (`Array<string>`).

Sorted by most dependents first.

### `npmTopDownloads`

List of package names that are downloaded a lot (`Array<string>`).

Sorted by most downloaded first.

## Data

> 👉 **Note**:
> not all of these packages are popular.
> There are some false-positives,
> such that download counts can be gamed.

## Scripts

This repo includes several scripts to crawl different services.

###### All packages

```sh
node script/crawl-packages.js
```

Used to take a day but as this uses [`ecosyste.ms`][ecosystems] now it is very
fast,
30min to 1h.
Slightly less complete as actually using npm,
but as npm is unusable,
I’ll take it.

###### Top downloads

```sh
node script/build-top-dependent.js
node script/build-top-download.js
node script/build-top.js
```

These generate the JS files.

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now,
that is Node.js 16+.
It also works in Deno and modern browsers.

## Related

* [`npm-high-impact-cli`](https://github.com/rexxars/npm-high-impact-cli)
  — find the popular npm packages someone maintains
* [`npm-esm-vs-cjs`](https://github.com/wooorm/npm-esm-vs-cjs)
  — data on the share of ESM vs CJS on the public npm registry

## Contribute

Yes please!
See [*How to Contribute to Open Source*][opensource-guide-contribute].

## Security

This package is safe.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-npm-high-impact]: #npmhighimpact

[api-npm-top-dependents]: #npmtopdependents

[api-npm-top-downloads]: #npmtopdownloads

[badge-build-image]: https://github.com/wooorm/npm-high-impact/workflows/main/badge.svg

[badge-build-url]: https://github.com/wooorm/npm-high-impact/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/wooorm/npm-high-impact.svg

[badge-coverage-url]: https://codecov.io/github/wooorm/npm-high-impact

[badge-downloads-image]: https://img.shields.io/npm/dm/npm-high-impact.svg

[badge-downloads-url]: https://www.npmjs.com/package/npm-high-impact

[badge-size-image]: https://img.shields.io/bundlejs/size/npm-high-impact

[badge-size-url]: https://bundlejs.com/?q=npm-high-impact

[ecosystems]: https://ecosyste.ms

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[npmjs-install]: https://docs.npmjs.com/cli/install

[opensource-guide-contribute]: https://opensource.guide/how-to-contribute/

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
