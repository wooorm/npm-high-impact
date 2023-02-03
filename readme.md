# npm-high-impact

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

The high-impact (popular) packages of npm.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`npmHighImpact`](#npmhighimpact)
    *   [`npmTopDependents`](#npmtopdependents)
    *   [`npmTopDownloads`](#npmtopdownloads)
*   [Data](#data)
*   [Scripts](#scripts)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [Security](#security)
*   [License](#license)

## What is this?

This package exposes the names of popular packages on the public npm registry.
The definition of the term *popular* here is the same as what npm itself calls
*high-impact*.
They classify packages as having a high impact on the ecosystem when a package
meets one or more of the following conditions:

*   download count of 1 000 000 or more per week
*   depended on by 500 or more other packages

## When should I use this?

Please use this for fun experiments when researching the npm registry.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+ and 16.0+), install with [npm][]:

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
6050
[
  'supports-color',
  'semver',
  'ansi-styles',
  'chalk',
  'debug',
  'ms',
  'has-flag',
  'source-map',
  'color-name',
  // …
]
```

## API

This package exports the identifiers [`npmHighImpact`][api-npm-high-impact],
[`npmTopDependents`][api-npm-top-dependents], and
[`npmTopDownloads`][api-npm-top-downloads].
There is no default export.

### `npmHighImpact`

List of top package names (`Array<string>`).
Sorted by most downloaded first.
Includes (unique) packages from `npmTopDependents` and `npmTopDownloads`.

### `npmTopDependents`

List of package names that are depended on a lot (`Array<string>`).
Sorted by most dependents first.

### `npmTopDownloads`

List of package names that are downloaded a lot (`Array<string>`).
Sorted by most downloaded first.

## Data

> 👉 **Note**: not all of these packages are popular.
> There are some false-positives, such that download counts can be gamed, and
> that `libraries.io` sometimes thinks that a fork of webpack or so is actually
> webpack.

## Scripts

This repo includes several scripts to crawl different services.

###### Top dependents

`script/crawl-top-dependents.js` looks for packages that are depended on by
500 or more other packages.
The script takes like 30 minutes to run and currently gets about 3 000
packages.

It crawls the `libraries.io` [project search API][libraries-io-api], whose
results can also [be browsed on the web][libraries-io-web].
Crawling stops paginating when a package is seen that is depended on by less
than 500 other packages.

You need an API key for `libraries.io`, see their API docs for more info.

###### All packages

`script/crawl-packages.js` follows an append-only database to find all the
changes to things in the npm registry.
We filter duplicates out, but still end up with ±2.5m “things”, which aren’t
all proper packages.
Later scripts will have to deal with them being missing.

The script takes like 12-18 hours to run (it finished somewhere at night).
But the good news is that it’s additive: so the next time you run it, it’ll
only pull in everything that changed since you last ran in.

It crawls [`replicate.npmjs.com`][npm-replicate].

###### Top downloads

`script/crawl-top-downloads.js` looks for download counts of all ±2.5m packages
on the registry.
Later scripts can filter the complete list to get the top packages.
The script takes like 15 hours to run.
About 6 hours is spent on ±1.9m unscoped packages.
The other 9 on the ±600k scoped packages (yes, sad).
After filtering, the interesting data would result in about 6k packages.

It crawls the npm [package download count API][npm-api].
Unscoped packages are crawled using the batch API to get 128 per request.
Scoped packages are crawled with 20 HTTP requests at a time, as there is no
batch API, and higher rates are limited by npm.

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
It also works in Deno and modern browsers.

## Related

*   [`npm-high-impact-cli`](https://github.com/rexxars/npm-high-impact-cli)
    — find the popular npm packages someone maintains
*   [`npm-esm-vs-cjs`](https://github.com/wooorm/npm-esm-vs-cjs)
    — data on the share of ESM vs CJS on the public npm registry

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## Security

This package is safe.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/npm-high-impact/workflows/main/badge.svg

[build]: https://github.com/wooorm/npm-high-impact/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/npm-high-impact.svg

[coverage]: https://codecov.io/github/wooorm/npm-high-impact

[downloads-badge]: https://img.shields.io/npm/dm/npm-high-impact.svg

[downloads]: https://www.npmjs.com/package/npm-high-impact

[size-badge]: https://img.shields.io/bundlephobia/minzip/npm-high-impact.svg

[size]: https://bundlephobia.com/result?p=npm-high-impact

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[libraries-io-api]: https://libraries.io/api#project-search

[libraries-io-web]: https://libraries.io/search?platforms=npm&sort=dependents_count&order=desc

[npm-api]: https://github.com/npm/registry/blob/master/docs/download-counts.md

[npm-replicate]: https://github.com/npm/registry-follower-tutorial/blob/master/README.md

[api-npm-high-impact]: #npmhighimpact

[api-npm-top-dependents]: #npmtopdependents

[api-npm-top-downloads]: #npmtopdownloads
