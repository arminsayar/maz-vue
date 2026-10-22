/**
 * A tiny stand-in for the product API, used to prove that the built app takes
 * its API base URL from the environment at runtime.
 *
 * Start it on a port, then boot the production build with
 * `NUXT_PUBLIC_API_BASE=http://127.0.0.1:<port> node .output/server/index.mjs`
 * — the pages should render *these* products, proving the URL is deployment
 * configuration rather than a value baked into the source.
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_PORT ?? 4100)

const PRODUCTS = [
  {
    id: 101,
    title: 'Mock Product One',
    price: 11.5,
    description: 'Served by the local mock API.',
    category: 'electronics',
    image: 'https://example.test/mock-1.png',
    rating: { rate: 4.2, count: 7 }
  },
  {
    id: 102,
    title: 'Mock Product Two',
    price: 22.25,
    description: 'Served by the local mock API.',
    category: 'jewelery',
    image: 'https://example.test/mock-2.png',
    rating: { rate: 3.1, count: 3 }
  }
]

createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  res.setHeader('Content-Type', 'application/json')

  if (path === '/products') {
    res.end(JSON.stringify(PRODUCTS))
    return
  }
  if (path === '/products/categories') {
    res.end(JSON.stringify(['electronics', 'jewelery']))
    return
  }

  const single = path.match(/^\/products\/(\d+)$/)
  if (single) {
    const found = PRODUCTS.find((product) => product.id === Number(single[1]))
    res.statusCode = found ? 200 : 404
    res.end(JSON.stringify(found ?? {}))
    return
  }

  // The "more like this" rail on the detail page.
  const byCategory = path.match(/^\/products\/category\/(.+)$/)
  if (byCategory) {
    const wanted = decodeURIComponent(byCategory[1])
    res.end(
      JSON.stringify(PRODUCTS.filter((product) => product.category === wanted))
    )
    return
  }

  res.statusCode = 404
  res.end('{}')
}).listen(PORT, () => {
  console.log(`mock API listening on http://127.0.0.1:${PORT}`)
})
