---
title: 超短 demo
pubDate: 2020-09-26
tags: ['css', 'browser']
layout: /src/layouts/Post.astro
---

<!-- 相同 CSS 但各瀏覽器不同渲染的結果，讓你知道渲染引擎如何運作 -->

有一天看著阮一峰的 [科技愛好者周刊](http://www.ruanyifeng.com/blog/2018/07/weekly-issue-14.html)，突然看到 [這個東西](https://codepen.io/MartijnCuppens/pen/MXojmw) 。

[@Martijn_Cuppens](https://twitter.com/Martijn_Cuppens/status/1015169981368225793) 寫了一個空的 div 還有幾行 CSS，這個 div 就能在瀏覽器上渲染出不同的圖形如下。

![](/img/post/0__nHm6zS0QfERpQAzz.jpg)

驚！勾起小弟一點好奇心，CSS 也可以做 browser，雖然使用 window 沒辦法使用 safari，來測試，而且 codepen 也不支持 IE，但還是利用手邊的瀏覽器還有一些服務像是 [browserling](https://www.browserling.com/), [lambdatest](https://www.lambdatest.com/) 來測試。

- Edge 的結果，這裡是使用 Microsoft Edge 44.18362.449.0 版本的 edge ，所以還沒有換到最新的基於 chromium 的版本。

![](/img/post/0__u6QZiPRtH2ENt1Ub.jpg)
