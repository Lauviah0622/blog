import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import react from '@astrojs/react'
import { h } from 'hastscript'
import { toString } from 'hast-util-to-string'
import { fileURLToPath } from 'url'
import remarkCalcReadingMin from './src/plugins/remarkCalcReadingMin.mjs'
import nodejs from '@astrojs/node'
import vercel from '@astrojs/vercel/serverless'
const root = fileURLToPath(new URL('.', import.meta.url))
const isDev = process.env.DEV
const site =
  process.env.VERCEL_ENV === 'preview'
    ? `https://${process.env.PUBLIC_VERCEL_URL}`
    : process.env.SITE ?? 'http://localhost:3000'
console.log('site env', {
  PUBLIC_VERCEL_URL: process.env.PUBLIC_VERCEL_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  SITE: process.env.SITE,
})
console.log('site', site)

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap(), react()],
  site,
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [
      remarkCalcReadingMin,
      'remark-gfm',
      ['remark-directive', {}],
      ['remark-directive-rehype', {}],
      'remark-smartypants',
      [
        'remark-prism',
        {
          plugins: ['diff-highlight', 'line-numbers'],
        },
      ],
    ],
    rehypePlugins: [
      // Add a Rehype plugin that you want to enable for your project.
      // If you need to provide options for the plugin, you can use an array and put the options as the second item.
      'rehype-slug',
      [
        'rehype-autolink-headings',
        {
          behavior: 'prepend',
          content(node) {
            return [h(null, '#')]
          },
          properties: {
            ariaHidden: true,
            tabIndex: -1,
          },
        },
      ],
      [`${root}/src/plugins/imageTrans.mjs`, {}],
      [`${root}/src/plugins/tableWrapper.mjs`, {}],
    ],
  },
})
