import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import solid from '@astrojs/solid-js'
import react from '@astrojs/react'
import { h } from 'hastscript'
import { toString } from 'hast-util-to-string'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

const isDev = process.env.DEV


export default defineConfig({
  integrations: [sitemap(), react()],

  site: 'https://lavi-blog.vercel.app/',
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [
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
      // [`rehype-figure`, {}],
      [`${root}/src/plugins/imageTrans.mjs`, {}],
      [`${root}/src/plugins/tableWrapper.mjs`, {}],
    ],
  },
})
