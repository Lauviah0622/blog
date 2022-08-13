import { visit } from 'unist-util-visit'

import { h } from 'hastscript'

// origin code from https://github.com/josestg/rehype-figure

function rehypeFigure(option) {
  const className = (option && option.className) || 'rehype-figure'

  function buildFigure({ properties }) {
    const figure = h('figure', { class: className }, [
      h('img', { ...properties, loading: 'lazy' }),
      properties.alt && properties.alt.trim().length > 0
        ? h('figcaption', properties.alt || properties.title)
        : '',
    ])
    return figure
  }

  return function (tree) {
    visit(tree, { tagName: 'p' }, (node, index) => {
      const images = node.children
        .filter((n) => n.tagName === 'img')
        .map((img) => buildFigure(img))

      if (images.length === 0) return

      tree.children[index] =
        images.length === 1
          ? images[0]
          : (tree.children[index] = h(
              'div',
              { class: `${className}-container` },
              images
            ))
    })
  }
}

export default rehypeFigure
