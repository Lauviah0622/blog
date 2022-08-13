---
title: DEMO
pubDate: 2017-06-01
tags: ['personal']
layout: /src/layouts/Post.astro
cover: ./images/0524_NearMe-landingPage_20220524_1653356707583.png
summary: Enable typographer option to see result.
---

## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ 'title text!')

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)

## Images

![Minion](https://octodex.github.com/images/minion.png)

![212331]()
![Stormtroopocat](./images/2c43c0f60741dcdc7e86cad4dbc7bd0617c57e3d46171013175d86601dd97bbb.png 'The Stormtroopocat')
![Stormtroopocat](./images/2c43c0f60741dcdc7e86cad4dbc7bd0617c57e3d46171013175d86601dd97bbb.png 'The Stormtroopocat')

![Stormtroopocat](./images/2c43c0f60741dcdc7e86cad4dbc7bd0617c57e3d46171013175d86601dd97bbb.png 'The Stormtroopocat')
2123123123123123123

![Stormtroopocat](./images/2022-06-16_20220616_1655365539825.png 'The Stormtroopocat')

![Stormtroopocat](./images/2c43c0f60741dcdc7e86cad4dbc7bd0617c57e3d46171013175d86601dd97bbb.png 'The Stormtroopocat')

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg 'The Dojocat'

## Plugins

The killer feature of `markdown-it` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).

### [Emojies](https://github.com/markdown-it/markdown-it-emoji)

> Classic markup: :wink: :crush: :cry: :tear: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.

### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

- 19^th^
- H~2~O

### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++

### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==

### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

    and multiple paragraphs.

    and multiple paragraphs.

[^second]: Footnote text.
