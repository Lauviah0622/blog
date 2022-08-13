import { visit } from 'unist-util-visit'

import { h } from 'hastscript'

// origin code from https://github.com/josestg/rehype-figure

function rehypeTable(option) {
  const className = option?.className ?? 'table-container'

  return function (tree) {
    visit(tree, { tagName: 'table' }, (node, index) => {
      const wrappedTable = h('div', { class: className }, node)
      tree.children[index] = wrappedTable
    })
  }
}

export default rehypeTable
