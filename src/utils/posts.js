
export const sortPosts = (posts) =>  posts.sort(({ frontmatter: { pubDate: pubDateA } }, { frontmatter: { pubDate: pubDateB } }) => {
  const a = new Date(pubDateA).getTime();
  const b = new Date(pubDateB).getTime();
  return b - a
})

export default sortPosts
