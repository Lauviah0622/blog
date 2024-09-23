import { visit } from 'unist-util-visit'

import { h } from 'hastscript'

// origin code from https://github.com/josestg/rehype-figure

const matchIframeHTMLTag = (html) => {
  return !!html.match(/^\<iframe/)
}

function rehypeIframe(option) {
  const className = option?.className ?? 'iframe-container'

  return function (tree) {
    visit(tree, {type: 'raw'}, (node, index) => {
      if (!matchIframeHTMLTag(node?.value ?? '')) return 

      const wrappedIframe = h('div', { class: className }, node)
      tree.children[index] = wrappedIframe
    })
  }
}

export default rehypeIframe
