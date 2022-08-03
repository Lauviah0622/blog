# Astro Starter Kit: Blog
```
npm init astro -- --template blog
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ SEO-friendly setup with canonical URLs and OpenGraph data
- ✅ Full Markdown support
- ✅ RSS 2.0 generation
- ✅ Sitemap.xml generation

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Tour.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:3000`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 👀 Want to learn more?

Feel free to check [our documentation](https://github.com/withastro/astro) or jump into our [Discord server](https://astro.build/chat).


## 
新增功能
- 文章的圖片封面，文章的圖片 Header
- 自架的留言功能
- stat
- og image , title, desc弄好
- vote(看要弄在哪裡)
- collection
  - utils：專門放各種工具，用 tag 分費
  - sources：學習的一些資源，tree tag?
  - books
  - tips：每天一點 tips，tree 分類
現有功能
- minify
- csp
- blurry placeholder：在圖片載入前先用模糊的內嵌 svg 來呈現圖片
- responsive image srcset
- video gif
- tag list page
- jsonld
- AMP (不作)
- inlined css
- inlined script
- CICD => 但 vercel 已經作好了吧
- test
  - 檢查是不是每個 page 都有 
    - title
    - share widget
    - metadata
    - inline css
    - scripts element
    - SCP
    - aria button
    - json ld
    - publist date
    - image srcset

