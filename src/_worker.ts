import { Hono, Context } from 'hono'


const app = new Hono()

const pages = import.meta.glob<{ stream: (ctx: Context) => string }>('./pages/*(!(components/*)*/)*.(marko|js|ts)',  { eager: true, import: 'default' });

for (const [ key, page ] of Object.entries(pages)) {
  const path = key.replace(/^\.\/pages/, "") // remove ./pages prefix
    .replace(/\.[^\.]+$/, "") // remove extension
    .replace(/[/.]\$/g, "/:") // replace /$param and .$param with /:param
    .replace(/(?:\/index)+(\/|$)/g, "/") // replace /index with /
  app.get(path, (ctx) => ctx.html(page.stream(ctx)))
}

app.get('/favicon.ico', async (ctx) => await ctx.env.ASSETS.fetch(ctx.req))
app.get('/assets/*', async (ctx) => await ctx.env.ASSETS.fetch(ctx.req))

export default app