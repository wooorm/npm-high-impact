import {join} from 'path'
import {Agent,interceptors,setGlobalDispatcher} from 'undici'
import minimist from 'minimist'

export const argv = minimist(process.argv.slice(2), {
  default: {
    time: 'last-week',
    min: 500,
  }
});

export function configure() {
  // Interceptors to add response caching, DNS caching and retrying to the dispatcher
  const { cache, dns, retry } = interceptors

  const defaultDispatcher = new Agent({
    connections: 100, // Limit concurrent kept-alive connections to not run out of resources
    headersTimeout: 10_000, // 10 seconds; set as appropriate for the remote servers you plan to connect to
    bodyTimeout: 10_000,
  }).compose(cache(), dns(), retry())

  setGlobalDispatcher(defaultDispatcher) // Add these interceptors to all `fetch` and Undici `request` calls
}

export async function resume({ type = 'scoped' }) {
  const lastpath = join(
    import.meta.dirname,
    `../data/download-counts-${type}.last.json`
  )

  try {
    const json = await import(`${lastpath}`, { with: { type: 'json' } });
    return {
      last: json.default,
      lastpath,
    }
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND') {
      console.warn('[%s] Error reading %s: %s', err.code, lastpath, err.message);
    }

    return { lastpath };
  }
}
