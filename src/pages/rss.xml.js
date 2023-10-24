import rss from '@astrojs/rss'
import dayjs from 'dayjs'

const posts = import.meta.globEager('./post/*.md')
const tips = import.meta.globEager('./tip/*.md')

const items = [...Object.values(posts), ...Object.values(tips)]
  .map((post) => ({
    link: post.url,
    title: post.frontmatter.title,
    pubDate: post.frontmatter.pubDate,
  }))
  .sort(({ pubDate: dateA }, { pubDate: dateB }) => {
    return dayjs(dateA).isAfter(dayjs(dateB)) ? -1 : 1
  })

export const GET = () =>
  rss({
    // `<title>` field in output xml
    title: 'Apprentice :og',
    // `<description>` field in output xml
    description: 'A humble Astronaut’s guide to the stars',
    // base URL for RSS <item> links
    // SITE will use "site" from your project's astro.config.
    site: import.meta.env.SITE,
    items,
    // items: posts.map((post) => ({
    //   link: post.frontmatter.slug,
    //   title: post.frontmatter.title,
    //   pubDate: post.frontmatter.pubDate,
    // }))
    // list of `<item>`s in output xml
    // simple example: generate items for every md file in /src/pages
    // see "Generating items" section for required frontmatter and advanced use cases
    // items,
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  })
