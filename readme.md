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
8599
[
  'semver',
  'ansi-styles',
  'debug',
  'supports-color',
  'chalk',
  'ms',
  'tslib',
  'has-flag',
  'minimatch',
  'strip-ansi',
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
> such that download counts can be gamed,
> and that `libraries.io` sometimes thinks that a fork of webpack or so is
> actually webpack.

## Scripts

This repo includes several scripts to crawl different services.

###### All packages

```sh
node script/crawl-packages.js
```

…follows an append-only database to find all the changes to things in the npm
registry.
We filter duplicates out,
but still end up with ±2.5m “things”,
which aren’t all proper packages.
Later scripts will have to deal with them being missing.

The script takes like 12-18 hours to run (it finished somewhere at night).
But the good news is that it’s additive:
so the next time you run it,
it’ll only pull in everything that changed since you last ran in,
which could be as little as 15 minutes for 3 months.

It crawls [`replicate.npmjs.com`][github-npm-replicate].

###### Top downloads

```sh
node script/crawl-top-download-unscoped.js
node script/crawl-top-download-scoped.js
```

…look for download counts of all ±4.1m packages on the registry.
Later scripts can filter the complete list to get the top packages.
The script takes like 30 hours to run.
About 10 hours is spent on ±4m unscoped packages.
Another 20 or so on ±1.2m scoped packages (yes,
sad).
After filtering,
the interesting data would result in about 6k packages.

It crawls the npm [package download count API][github-npm-api].
Unscoped packages are crawled using the batch API to get 128 per request.
Scoped packages are crawled with 20 HTTP requests at a time,
as there is no batch API,
and higher rates are limited by npm.

###### Top dependents

```sh
node script/crawl-top-dependent.js
```

…looks for packages that are depended on by 500 or more other packages.
The script takes like 30 minutes to run and currently gets about 3 000
packages.

It crawls the `libraries.io` [project search API][libraries-io-api],
whose results can also [be browsed on the web][libraries-io-web].
Crawling stops paginating when a package is seen that is depended on by less
than 500 other packages.

You need an API key for `libraries.io`,
see their API docs for more info.

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

[esmsh]: https://esm.sh

[file-license]: license

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-npm-api]: https://github.com/npm/registry/blob/master/docs/download-counts.md

[github-npm-replicate]: https://github.com/npm/registry-follower-tutorial/blob/master/README.md

[libraries-io-api]: https://libraries.io/api#project-search

[libraries-io-web]: https://libraries.io/search?platforms=npm&sort=dependents_count&order=desc

[npmjs-install]: https://docs.npmjs.com/cli/install

[opensource-guide-contribute]: https://opensource.guide/how-to-contribute/

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
