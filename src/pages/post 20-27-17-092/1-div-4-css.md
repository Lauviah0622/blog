---
title: 1 個 div 和 4 行 CSS 就能更了解瀏覽器渲染引擎
pubDate: 2021-09-26
tags: ['css', 'browser']
layout: /src/layouts/Post.astro
summary : 行 CSS，這個 div 就能在瀏覽器上渲染出不同的圖形如下 div 就能在瀏覽器上渲染出不同的圖形如下。
---

<!-- 相同 CSS 但各瀏覽器不同渲染的結果，讓你知道渲染引擎如何運作 -->

有一天看著阮一峰的 [科技愛好者周刊](http://www.ruanyifeng.com/blog/2018/07/weekly-issue-14.html)，突然看到 [這個東西](https://codepen.io/MartijnCuppens/pen/MXojmw) 。

[@Martijn_Cuppens](https://twitter.com/Martijn_Cuppens/status/1015169981368225793) 寫了一個空的 div 還有幾行 CSS，這個 div 就能在瀏覽器上渲染出不同的圖形如下。

![](/img/post/0__nHm6zS0QfERpQAzz.jpg)

驚！勾起小弟一點好奇心，CSS 也可以做 browser，雖然使用 window 沒辦法使用 safari，來測試，而且 codepen 也不支持 IE，但還是利用手邊的瀏覽器還有一些服務像是 [browserling](https://www.browserling.com/), [lambdatest](https://www.lambdatest.com/) 來測試。

- Edge 的結果，這裡是使用 Microsoft Edge 44.18362.449.0 版本的 edge ，所以還沒有換到最新的基於 chromium 的版本。

![](/img/post/0__u6QZiPRtH2ENt1Ub.jpg)

- Firefox 的結果，版本是 76

![](/img/post/0__Awj74dFF__OVvhDS0.jpg)

- 用 browserling ，firefox ver.68 在 window 7 上測試的結果是

![](/img/post/0__DeOeROeZjCJ51iTG.jpg)

- chrome 的結果，版本是 84.0.4147.105

![](/img/post/0__UufqtVjO3cWW5I6I.jpg)

- 用 lambdatest 在 safari 10.1 上面測試的結果。 codepen 就是傲嬌，嫌不支援又 render 出來

![](/img/post/0__KD8KruS4a4ly8Jr0.jpg)

- 用 lambdatest 在 opera 68 上面測試的結果

![](/img/post/0__XqGjXjT5cmL2Ty__q.jpg)

結果大概是這樣。會有這些結果其實不意外，每個瀏覽器都有自已的渲染引擎，一個 HTML 跟 CSS 卻各自表態，所以實現出來的東西當然也是不一樣。不過厲害的是這個簡單的 CSS 竟然剛好可以在這些主流(?)瀏覽器上可以顯示不一樣的結果。

### 顯示結果與瀏覽器的關係？

為什麼不同的瀏覽器，但是 Render 的內容出來是一樣的？但有些相同瀏覽器，版本不同卻有不同的結果。

這就得講到剛剛提到的[**渲染引擎**](https://en.wikipedia.org/wiki/Browser_engine)，渲染引擎的工作之一就是把 HTML 還有 CSS 的程式碼轉換成我們看的到的圖形介面。（其實這裡自己對渲染引擎還有很多不了解，有錯誤在麻煩各位提點。）

雖然是不同的瀏覽器，但如果使用相同的渲染引擎，那理所當然會渲染出同樣的畫面（像是筆電有各種牌子，但是作業系統都是 windows，所以畫面相同）。反之，就算是同樣的瀏覽器，可能因為開發成本過高或者是各種原因，不同的版本也可能使用不同的渲染引擎；抑或是引擎本身有更新，也會導致渲染出來的內容不一樣。

在不同版本更換渲染引擎這點，對前端開發最著名 也是最可喜可賀的案例就是 Edge 吧。從 2020.1.15 開始，Edge 開始基於 [Chromium](https://zh.wikipedia.org/wiki/Chromium) 開發，理所當然地也沿用了 Chromium 的渲染引擎。

![](/img/post/0__pP9oy__w25Nzt1RqV.jpg)
![](/img/post/0__H3xqFd1UZ6UBsq83.jpg)

雖然沒有測試新版的 edge ，不過可想而知應該會得到相同的結果。

那既然提到了渲染引擎，那麼目前各瀏覽器的渲染引擎又是那些呢？其實可以從上面的結果大概知道有哪幾種引擎，我們先複習一下剛剛那張圖。

![](/img/post/0__j206rgz3EuduI8bn.jpg)

可以看到有 Firefox, Edge, Chrome, Safari, IE 這五種瀏覽器各呈現不同的方塊。也各代表不同的渲染引擎：

### CSS prefix

知道有這些渲染引擎有甚麼用？還記得有時候我們會做下面這件事情。也就是幫 CSS 的屬性加上 prefix

[https://gist.github.com/9abe6552429875722405b74998825e3b](https://gist.github.com/9abe6552429875722405b74998825e3b)

看到前面的 prefix： `-webkit-`, `-moz-` 可能覺得有些眼熟。是的，這些 prefix 就是要寫給渲染引擎看的。有一些比較新或者是還沒被廣泛應用的 CSS 屬性需要加上 prefix 才可以在特定的瀏覽器正常運作。

不過當去查資料時，會發現支援 chrome 還有 safari 的 prefix 都是 `-webkit-` ，這是因為 chrome 的引擎 Blink 是從 WebKit [分出來的](https://zh.wikipedia.org/wiki/WebKit#%E9%96%8B%E7%99%BC%E5%88%86%E8%A3%82)。所以才會同樣使用 `-webkit-` ，不過由於實際上是不同的引擎，所以可能會遇到同樣的 CSS 屬性，webkit / Blink 引擎要加 prefix 但是另一個不用加的情形。

### CSS 怎麼導致這種情形的？

講了那麼多，不過到底是甚麼屬性導致這些瀏覽器各自表態？我們看看 CSS 的原始碼。

[https://gist.github.com/08528f98399d9daa91e00ecf1c7e8c18](https://gist.github.com/08528f98399d9daa91e00ecf1c7e8c18)

去掉置中的屬性，真正有趣的是 div 裡面的下面四個。

[https://gist.github.com/e05825df9927e6228f3041d3ce72184b](https://gist.github.com/e05825df9927e6228f3041d3ce72184b)

`width` 以及 `height` 賦予元素高度以及寬度。那 `outline` 做了些甚麼？我們看一下 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/outline-style) 上面的說法：

> _An outline is a line that is drawn around an element, outside the border._

outline 可以在 border 外面再加上邊框。而 `outline` 這個屬性是 `outline-style`, `outline-width`, `outline-color` 這三個屬性的簡寫。分別設定樣式、寬度還有顏色。 案例中的 `inset` 代表著 [outline 會是嵌入狀的樣式](https://developer.mozilla.org/zh-CN/docs/Web/CSS/outline-style) 。

![](/img/post/0__5NPDlxYpxbvLVKcP.jpg)

而 `outline-offset` 則是設置 outline 的偏移，剛剛講說 outline 可以在 border 外面再加上邊框， `outline-offset` 的數值可以讓 border 跟 outline 之間新增距離，也就是 border 跟 outline 之間會有間距的意思。

![](/img/post/0__Iq3kO5DG9__Lu6l3Q.jpg)

> _可以看到 offset 增加了 border 跟 outline 之間的空間。_

那跟呈現剛剛那樣的形狀有甚麼關係？我們先關掉 `outline-offset` 看看結果。

![](/img/post/0__WmeLVd5rzByrYG9t.jpg)

可以看到其實蠻正常的，因為沒有 `border`，所以就是在一個空白的 `div` 外面加上粗度 100 的 `outline`，然後用 `inset` 的樣式。

找到兇手了！就是 `outline-offset` ！

![](/img/post/0__tmHWGl807CtouMtY.jpg)

我們看看這 `outline-offset` 幹了甚麼好事。

`outline-offset: -125px;` 代表在 border 外面加上 `-125px` 的間距，這到底是甚麼意思？如果說正值是以 border 為準，從 border 向外推 offset 的距離再開始新增 outline，那負值可以說是向內推再開始新增 outline。

![](/img/post/0__iwKcs65P8zYKsd__0.jpg)
![](/img/post/0__swXYDgauMZvdFWCU.jpg)

> _因為向內 30px 所以和 border 是同樣的位置，但是 outline 會在 border 之上，所以把 border 遮住了。_

如果我們把數值改成 `outline-offset: -50px;` 那會怎麼樣？

![](/img/post/0__W3XiCUbIyfTDO7CZ.jpg)

這個結果還算蠻合理的，寬和高都是 100px，所以 `outline-offset: -50px;` 會把整個 div 。那如果數值在繼續降低呢？讓我們繼續看下去。

![](/img/post/0__MkOcmyZnr6KsrFk0.jpg)
![](/img/post/0__xwUfJfjHCodPvV8z.jpg)
![](/img/post/0____3RJrP8pQdXqkItP.jpg)

其實降低到比自身的大小還小我已經不知道發生甚麼事情了… 我想這應該可以說是一個 bug 吧（又者是彩蛋？）。不過可以看到其實數值小於 `-100` 就可以看到雛型了，數值特別設為 `-125` 應該只是為了美妙的圖案而已。

上面的範例都是用 chrome 開啟的，因為 Blink 有自己的算法，小弟也不太清楚這塊，如果有人了解說是哪一個部分會處理到這塊或者是有一些方向歡迎私訊小弟…

不過我們終於找到答案了，解開說為什麼只是一個 `div` 的 CSS 。竟然會導致在不同的瀏覽器有不同的圖案呈現：

> _因為_ `_outline-offset_` _的偏移設為負數，並且小於能夠縮退的自身的高度和寬度，導致渲染引擎的算法渲染出 不可理解的 特殊形狀，_

### 結語

看到這個 case 其實蠻有趣的，不過因為 twitter 上已經是 2018 的文章了，時代在進步，瀏覽器也在更新中，所以現在這個 case 在不同的瀏覽器上已經沒辦法完全渲染出不同的圖形了。

這個東西可以應用在哪？請諒小弟才疏學淺…我也不知道，反正就是很酷就對了。不過我們可能可以嘗試更多不同的 CSS 屬性組合，找一些 CSS 數值的 edge case，可能也有相同的效果。

如果有甚麼想法可以多多交流，有錯誤也歡迎在下面指正或者是留言。 Big guy is John，感謝各位收看。

_Originally published at_ [_http://github.com_](https://gist.github.com/1290f33eca120c10ff394ed1218a53cc)_._
