export default {
  blogName: 'Apprentice Log',
  description: 'The log of the apprentice',
  pageSize: {
    posts: 10,
    archive: 20,
    tips: 12,
  },
  path: {
    posts: '/src/posts/*.md',
  },

  navLink: {
    landing: '/',
    archive: '/archive',
    tips: '/tips',
    tags: '/tags',
    collection: '/collection',
    // about: '/about',
  },
  title: {
    archive: 'Archive',
    collection: 'Collection',
    tips: 'Tips',
    tags: 'Tags'
  }
}
