---
title: 用 Astro 重寫部落格的心得
pubDate: 2022-08-19T00:00:00.000Z
tags:
  - astro
  - SSG
summary: 包含使用 Astro 的寫部落格的想法和介紹一下新家，順便聊聊中間的一些過程。
cover: /assets/images/post/20220819_astro-blog_1.jpg
layout: /src/layouts/Post.astro

---
## TL;DR

對一個前端工程師來說，不論你學的是哪個框架，Astro 會是現代建構靜態網站的好選擇之一。

沒錯，又重寫部落格了。

## 為何重寫？

還記得上一次架好部落格之後，寫了篇[用 11ty 寫部落格的心得](./11ty-blog)來總結自己寫部落格的心得，但大概經過了不到半年，又想重新寫部落格了。對，我就是那個寫過的部落格比寫過的文章還要多的人。

會想重寫的原因，我想還是因為想要提起紀錄以及產出的習慣，但就像過年的願望一樣，雖然有寫過一些文章（大部分還是在程式導師課程中產出的），但卻一直無法養成長期的習慣，大多都是一時興起。也讓自己從這點開始思考，思考說到底是什麼讓自己不想動筆，以下總結了幾個原因：

### 部落格太醜、Bug 太多

之前的部落格其實有一些問題，例如：

![左邊的 toc 有點陽春](/assets/images/post/20220819_astro-blog_061341.png)  
![mobile 大跑版](/assets/images/post/20220819_astro-blog_061424.png)  

總的來講，就是有些 Bug，然後顏值也不夠高，而且之前寫的時候不管是文章還是網站都蠻馬虎的，給別人看怕丟臉，後來也沒什麼更新，所以也不太會和別人提起部落格的事情。

### 長文不好寫，何不寫點短的？

過去的文章大部分都是需要閱讀 10 分鐘以上的稍長文章。拘泥於一定要寫一篇內容充足的文章的後果，就是總是自己遲遲沒有下筆，導致這一年來幾乎沒有任何更新。

另外，在聽了 Ernest Chiang 在 COSCUP 的分享 [打造個人知識系統](https://www.youtube.com/watch?v=gLINYmK-g7k) 後，理解到說長篇的文章會是自己個人知識整合的最後一步，而在這之前，短篇幅的筆記可以作為思考或者想法的紀錄。這些內容也同樣放到部落格上作分享，或許等有一定量之後就可以整合成長篇文章。

另外一個思考點是，如果把部落格的定位放在紀錄，目標放在養成產出的習慣，那或許做為永遠在剛起步的我也不用太拘泥於文章的長短，像 [flaviocopes](https://flaviocopes.com/)中的每天一則短文也是很好的形式。

總之，似乎也不用太拘泥於篇幅，想寫什麼就寫什麼吧。

### 搬運文章太麻煩

平常寫文章會在自己的筆記本裡面寫，寫完之後再搬進 Blog 的 Repo 中。但這個流程有個問題，平常在寫文章時會嵌入圖片，如果圖片一多，搬運圖片以及修改文章裡面的連結就會非常麻煩。不過也不是無法解決，寫個腳本就可以了，就只是遲遲沒有動手而已。

總之，基於以上這些理由，還有單純的想寫，就決定開始重寫部落格了(？？？？除了部落格很醜以外明明沒什麼關聯)

## Astro

這次的重寫主要使用 [Astro](https://astro.build/) 這套 framework，而我想這才是本文重點，首先想先聊聊，為什麼會選擇 Astro

### 為什麼選用 Astro

我的需求是這樣

- static site
- 能夠可以讀取 markdown 內容，甚至會需要客製化渲染出來的 HTML 內容
- 有自己的 design guileline，所以不用模版

但其實這些東西 [11ty](https://www.11ty.dev/) 完全可以做到，畢竟 ver.1 就是用 11ty 寫的。但問題就在於 11ty 的開發體驗很糟，這裡是自己的體驗：

- style 難以管理，因為沒辦法使用 module css
- 11ty 也有類似 component 的功能，但是只在 HTML 的層級（也就是 nunjucks）
- 實在是沒辦法喜歡 nunjucks
- 如果要寫一些會動的東西，寫原生的 JS 很崩潰

而因為這些因素，自己開始尋找一些製作部落格框架，像是

- Gatsby
- Next.js
- Hexo
- Hugo
- ...族繁不及備載

上面這些眾多鼎鼎有名的框架，而且甚至有些是專屬於 React 的生態的工具。不過最後還是選了這套很潮的 Astro

![](/assets/images/post/20220819_astro-blog_063723.png)  

其實最一開始選 Astro 並沒有想太多，說白了就是潮，以及想要藉由重寫部落格的機會碰些新東西。就那麼剛好 Astro 出現了，那個時候大概還是 Beta 版，記得當時 Astro 的標語十分驚人：

> Supports React, Preact, Svelte, Vue, Solid, Lit and more.

身為 React 小粉絲的我直接震驚了，我甚至還沒想到為什麼要在一個 static site 中使用 React，只覺得說這東西太帥了，這是什麼框架界的吸星大法。

但當然一套框架有好的部分也有壞的部分，在這裡就以自己開發部落格的經驗來聊聊使用 Astro 的一些想法。

:::warning
因為之前開發是使用 11ty，所以在文章中會大量的提到 11ty 以及模版引擎[^1]作為比較
:::

### Component: 把不同 runtime 的 code 寫在一起

Astro 有一個有趣的地方是，building runtime 和 browser runtime 的 code 會寫在一起

```jsx
---
import Base from './Base.astro';

import Pagination from '~/components/Pagination/Pagination.astro';
import ArchiveItem from '~/components/ArchiveItem.astro';
import metadata from '~/metadata';

const { page, baseUrl } = Astro.props;
// 從外部獲得頁面的資訊

---

<style>
  .postlist {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media screen and (max-width: 80rem) {
      gap: 2rem;
    }
  }
</style>

<Base title={metadata.title.archive}>
<h1>Archive</h1>
<ul class="postlist">
  <!-- 然後在這裡渲染出來 -->
  {page.data.map((post) =>
  <ArchiveItem post={post} />)}
</ul>
<Pagination page={page} baseUrl={baseUrl} />
</Base>

```

這裡是部落格中其中一個 Component 的 code，而這個 component 是作為一個 [Layout](https://docs.astro.build/en/core-concepts/layouts/) 被使用。在 Astro 中，上面被 `---` 分隔出來的部分稱作 [component script](https://docs.astro.build/en/core-concepts/astro-components/#the-component-script)，下面稱作 [component template](https://docs.astro.build/en/core-concepts/astro-components/#the-component-template)。component script 用來操作產生 template 的資料，而 component template 基本上就和模版引擎[^1]相同，內容會被 render 成 HTML。

咦？乍看之下有一點 PHP 的味道。~~沒關係，當年 react 也被詬病說像是 PHP。~~ 這樣的寫法有什麼樣的好處？比起像是 11ty 將資料流的部分隱藏在抽象之下，且利用模版引擎 nunjucks[^1] 產生 HTML，Astro 你會更清楚整個模版的資料來源，並且可以對資料來源做出符合 template 內容的操作。

像是 repo 中的 `Date.astro`，如果其他的 Component 只要傳進 `date` 作為參數，就會 render 出 format 過的時間

```jsx
<!-- src/components/Date.astro -->
---
import dayjs from 'dayjs';
const { date, naked = false } = Astro.props;
const formatTextDate = (date) => dayjs(date).format('MMM,DD YYYY');
const formatHTMLAttrDate = (date) => dayjs(date).format('YYYY-MM-DD');

const text = formatTextDate(date);
const datetime = formatHTMLAttrDate(date)
---

<style>
  .time {
    font-family: var(--font-family-serif);
  }
</style>


{naked ? 
<time datetime={datetime}>
  {text}
</time> : <div class="time">
  <time datetime={datetime}>
    {text}
  </time>
```

當然，這個範例沒什麼，如果你用模版引擎也可以做到，但是直接用 JS 操作有個好處：可以任意使用以及引入外部的 library，或者是對複雜的轉換作抽象來獨立出另外一個檔案，畢竟這就只是 node JS 而已。

在我自己的看法，Astro 這樣的作法有更重大的意義：

> 讓 Component 有更內聚的抽象

不單是模版上的重用(例如 nunjucks 的 [import](https://mozilla.github.io/nunjucks/templating.html#import))，Component 內部能夠包含資料流, HTML, style, 甚至是 script。這樣的抽象對於整個 Component 的重用我自己認為是更加清楚。

#### style

剛剛提到重用的部分，HTML 可以理解，style 以及 script 不會有問題嗎？

style 會有命名污染的問題，所以在使用模版引擎時總是得採用某種 css methodology (例如 BEM) 來作管理，在寫的時候也常常會使用 scss 來維持開發體驗，避免 class name 重複的問題。但在 Astro 中是這樣的：

```jsx
---
// ...component scripts
---
// ...component template
<style>
/* ... */
</style>
```

如果是 Vue 或者是 Svelte 的使用者看到這樣的語法大概也不會大驚小怪了，但作為 react 用戶的我覺得：真香。沒錯，所有的 [style tag](https://docs.astro.build/en/guides/styling/#scoped-styles) 內部的語法預設都是 scoped 的。

:::info  
正式版的 astro 在 hash 使用 [`where`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) 來新增 hashed class，不會增加 css 上的優先級，不會影響後續覆蓋 css 的狀況。

Astro 上的 `style`
```html
<style>
  h1 { color: red; }
  .text { color: blue; }
</>
```

v1 前 compile 出來的 `style`，會增加優先級
```html
<style>
  h1.astro-HHNQFKH6 { color: red; }
  .text.astro-HHNQFKH6 { color: blue; }
</style>
```

v1 之後 compile 出來的 `style`，不會增加優先級
```html
<style>
  h1:where(.astro-HHNQFKH6) { color: red; }
  .text:where(.astro-HHNQFKH6) { color: blue; }
</style>
```
:::

也是因為這樣，所以在開發的時候不太需要使用到 [Sass](https://sass-lang.com/) 那樣的 CSS Preprocessor：只需要以 Component 為單位作 class name 的命名，不需要考慮污染問題。自己這次在開發只使用 postcss 並搭配 `postcss-nesting` 以及 `postcss-import`(repo 中的 tailwind 沒有使用還沒有拔掉就是...)

#### script

除了 scoped style 之外，如果在 component 內部有 script，component 本身被使用多次會有 script 重複引入的問題，例如在其他模版引擎中：

```html
<!-- ./child.nunjucks -->
<script>
    console.log('child')
</script>
<!-- ... -->
```
```html
<!-- ./parent.nunjucks -->
<div>
    {% include "item.html" %}
    {% include "item.html" %}
    {% include "item.html" %}
    {% include "item.html" %}
</div>
```

```html
<!-- result -->
<div>
    <script>
        console.log('child')
    </script>
    <script>
        console.log('child')
    </script>
    <script>
        console.log('child')
    </script>
    <script>
        console.log('child')
    </script>
</div>
```

因為 `child` 被引入多次，而每一個 `child` 都有 `<scripts/>`，所以就會很單純的被引入了 n 次。但 Astro 很聰明的幫你處理了這個問題，在 Astro 中所有 component 中 script tag 的內容都會被另外 bundle，此外在[文件中](https://docs.astro.build/en/core-concepts/astro-components/#client-side-scripts)也提到

> If your component is used several times on a page, the script tag will only be included once.

如果同一個 component 的 script 被引入多次，只會被 bundle 一次，避免了上面的問題。

但其實如果你 JS 包含了複雜的 DOM 操作，那不應該使用 script，而是使用 Astro 最大的賣點：可以在 Astro 中使用各種 Framework component

#### Framework Component 

在 Astro 中，只要引入對應的 Package，就可以在 Astro 中使用像是 React, Vue, Svelte 等等框架的 Component，**甚至是多個不同的框架**

```jsx
---
// Example: Mixing multiple framework components on the same page.
import MyReactComponent from '../components/MyReactComponent.jsx';
import MySvelteComponent from '../components/MySvelteComponent.svelte';
import MyVueComponent from '../components/MyVueComponent.vue';
---
<div>
  <MySvelteComponent />
  <MyReactComponent />
  <MyVueComponent />
</div>
```

> 可以參考 [Framework Components](https://docs.astro.build/en/core-concepts/framework-components/)

在處理比較複雜的 DOM 操作時，例如在 Mobile 時需要用 JS 操作 Hamburger 選單的開合，比起直接操作 DOM，用這些框架處理起來絕對是更輕鬆容易，也能做到更複雜的操作。

除此之外，在 Astro 中使用 Framework Component 類似使用 SSR 框架一樣，會有一個 [Hydrate](https://docs.astro.build/en/core-concepts/framework-components/#hydrating-interactive-components) 的過程。而在 Astro 中可以決定要在什麼情況下進行 Hydrate，也就是開始使用 Framework Components。以剛剛的 Hamburger 為例，就可以使用 `client:media={QUERY}` 的方式，在指定的 media query 中才進行 Hydrate，來避免不必要的 JS 執行。

#### Jsx

除了剛剛提到的特點以外，在 Component template 的部分語法使用 JSX，這點對於 Vue 和 React 等等的使用者友善多了，降低一層學習成本。

### Router 以及專案結構

在 Router 方面，和 Next.js 一樣，採用資料夾以及檔名的方式來管理。自己是沒接觸過 Next，這樣的方式在的 server framework 不算特別。自己覺得有好有壞，沒有特別的想法。

但在檔案結構上，Astro 將 Page (Astro 中的 Router) 以及其他 Component (包含 layout 以及 component) 分離出來

```
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └-─ Button.jsx
│   ├── layouts/
│   │   └-─ PostLayout.astro
│   └── pages/
│   │   ├── posts/
│   │   │   ├── post1.md
│   │   │   ├── post2.md
│   │   │   └── post3.md
│   │   └── index.astro
│   └── styles/
│       └-─ global.css
├── public/
│   ├── robots.txt
│   ├── favicon.svg
│   └-─ social-image.png
├── astro.config.mjs
└── package.json
```

> 來自：https://docs.astro.build/en/core-concepts/project-structure/#example-project-tree

在使用上，會在 pages 內部引入文章的來源，然後再使用 layout 中的版面，像是這樣

```jsx
---
import Tags from '~/layouts/Tags.astro'
import sort from '~/utils/sortPosts'

let allPosts = await Astro.glob('/src/pages/post/*.md');
const sorted = sort(allPosts)

const allTagPosts = sorted.reduce((allTags, post) => {
  const tags = post.frontmatter.tags
  tags.forEach((tag) => {
    if (allTags?.[tag]) {
      allTags[tag].push(post)
    } else {
      allTags[tag] = [post]
    }
  });
  return allTags
}, {})

---

<Tags tags={allTagPosts} baseUrl={Astro.url} />
```

使用下來覺得這樣資料與界面的分離點是清楚的，避免同時一個檔案中做了太多的事情。

### Data fetching

在資料來源上，astro 保有了很大（真的非常大）的彈性。除了剛剛程式碼中可以讀取專案中的 markdown 以外。也可以透過 [fetch 的方式](https://docs.astro.build/en/guides/data-fetching/)透過 url 拿資料，這樣的方式對於有使用 CRM 或者是 Jamstack 的用戶十分友善。而且因為只是單純的 fetch，不管是要 Restful 還是 GraphQL 也都不是問題。


### Markdown

在 Page 中，你可以透過 `.astro` 檔案渲染指定的畫面，你也可以透過 markdown。其實用法也和其他 SSG 我想應該是大同小異，就是在 frontmatter 中加上 `layout` 的 property 而已。

#### Rehype, Remark
但在 Astro 自己蠻喜歡的一點是，你要修改 markdown 的渲染結果本身是很容易的：因為 Astro 本身使用 [remark](https://github.com/remarkjs/remark) 來作 markdown transform，並且轉化過後可以透過 [rehype](https://github.com/rehypejs/rehype) 來操作 HTML。

Remark 還有 Rehype 有一些（自己覺得並沒有算很多）的 plugin 可以使用，像是在部落格中比較常見的需求像是：[TOC](https://github.com/JS-DevTools/rehype-toc)，[Github flavor markdown](https://github.com/remarkjs/remark-gfm)(但其實 Astro 以經預設啟用了😜)等等都有既有的 open source plugin。

但即使沒有，其實要自己實現一些比較簡單的 plugin 並不複雜（個人覺得相較於 markdown-it）。而多了這一層可以操作 markdown 的空間，可以做到比單純的 markdown 渲染外更複雜的事情，例如：利用 [remark-directive](https://www.npmjs.com/package/remark-directive#example-youtube) 來做到 custom container 的 markdown 語法、又或者是可以把 `<img>` 改成用 `<figure>` 包住以便新增 caption 等等。

#### mdx

另外目前在 v1.0.0 正式版發布之後，也新增對於 mdx 的支持。雖然自己沒有使用，不過 mdx 本身可以讓部落格文章的互動性上升不只一個檔次，像是我自己最喜歡的 Blog [joshwcomeau.com](https://www.joshwcomeau.com/)，就有在[文章中](https://www.joshwcomeau.com/blog/how-i-built-my-blog/#mdx-the-secret-ingredient)提到自己是用 Mdx 寫文章，並使用 React 製作各種可互動的元件。


到目前為止，好像提的都是優點，但還是得平衡打擊一下。

### Cons

自己用下來有遇到幾個問題，首先先來提一個或許已經不是問題的問題：不太穩定

![蠻頻繁釋出小版本更新的，所以要注意 release note](/assets/images/post/20220819_astro-blog_061108.png)  


在最初開發時使用的是 beta 版，在用的時候也沒想太多，但沒想到最後要佈署的時候發布正式版了，API 改動讓自己在興奮到爆炸要佈署前潑了我一桶冷水。


另外，因為 `.astro` 檔案需要透過 parser 解析之後再做 bundle。所以會遇到一些 parser 以及 bundler 上的限制

:::info
Astro 本身是建構在 vite 之上，可以簡單想像成一套非常複雜的 vite config，但當然不單純只是這樣
:::

過去有想過因為想要讀取同樣文章但不同語言的翻譯，想要根據參數來拿包含特定檔名的資料，所以在 fetch 資料時使用變數，使用類似下面的語法。

```js
---
const lang = 'en'
const contact = Astro.fetchContent(`*.${lang}.md`);
---
```

:::warning
示意用，`Astro.fetchContent` API 已經被棄用
:::

但因為 [vite](https://vitejs.dev/) 的限制[^2]，導致使用 `fetchContent` 時參數不能使用包含變數的 string，雖然是過去 beta 版的問題，但如果是基於 vite 的限制，這部份可能比較難改善


[^2]:詳細的問題可以看 repo 的 [issue](https://github.com/withastro/astro/issues/1700)

`.astro` file 還有另外一個問題，自己相當依賴 auto format 的功能，雖然 Astro 有提供官方的 Vscode extension，但是 auto format 的部分還是有點笨...常常 format 出來很奇怪的 indent。

另外，比起成熟的 SSG 框架，像是 Hugo, Hexo, Gatsby 等等，目前 Astro 的生態比較沒有豐富的 start project，如果比較沒有客製化需求的用戶會比較痛苦一點。

就這點而言，沒有 start project 的另外一個問題是，原本用 11ty 時候使用的 [eleventy-high-performance-blog](https://github.com/google/eleventy-high-performance-blog) 本身真的是做的太好了，在安全性還有性能優化上真的是作到了極致[^3]，這些東西到了 Astro 都必須自己來。例如圖像優化的部分就會麻煩很多，high-performance-blog 甚至做到將影片轉為 gif 的功能。

:::info
在 v1.0.0 後新增了 [Image integration](https://docs.astro.build/en/guides/images/#astros-image-integration)，在圖片處理上方便了一點。但還沒使用過不確定優化的程度如何
:::

平衡打擊到這邊結束。不過就個人使用的經驗而言，考量開發體驗和學習成本，Astro 都是個優秀的選擇。當然，自己並沒有使用 Astro 的的所有功能（例如 SSR，還有更複雜的 router 等等），而且也沒有用過大多數的 SSG framework，這邊只是比較主觀的評價。

## 這次的部落格多了些什麼？

那到最後，回來談談自己的部落格。

這次的部落格除了把之前的 Bug 修掉~~同時產生新的 Bug~~，也新增了一些內容：

- 新增了一個 [Tips](/tips) 的分類，會多放一點篇幅比較短的文章
- 多了 [Collection](/collection)，這裡則是會放一些平常收集的文章、書、或者是學習資源
- 除此之外就是一些比較細部的 UI 改動

看得到的地方就是這樣，另外也搭配自己的筆記方式寫了一套腳本，來解決[搬運文章太麻煩](#搬運文章太麻煩) 的問題

![顏色很騷的 cli](/assets/images/post/20220819_astro-blog_065051.png)  

![部落格的 tickets...](/assets/images/post/20220819_astro-blog_060712.png)  


但其實在開發的過程中 Project 的 ticket 已經堆到天上開發不完，日後不管是 feature 還是文章我想都會比較頻繁的更新（希望），有興趣也歡迎訂閱 [RSS](https://lavif.me/rss.xml)，關於 Astro 和 新的部落格的介紹就到這邊。




[^1]: template engine, 像是 mustache, ejs, pug，11ty 則使用 nunjucks
[^3]: 可以參考過去寫的文章：[用 11ty 寫部落格的心得](./11ty-blog#eleventy-high-performance-blog)