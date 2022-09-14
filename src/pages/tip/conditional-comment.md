---
title: What is conditional comment?
pubDate: 2022-09-11T00:00:00.000Z
tags:
  - IE
  - legacy
summary: 一個你永遠不會再碰到的功能
cover: /assets/images/post/20220914_conditional-comment_225406.png
layout: /src/layouts/Post.astro

---
作為一位近期才開始接觸前端的開發者而言，看 Javascript Patterns[^js_patterns] 這本書是很有趣的事情。在這本書出版那個年代，還沒有 ES6，還在 ES5 的時期，而 IE 還是個無法逃避的巨嬰。開發者們想盡了各種方式來面對（例如還能再戰 20 年的 JQuery），而同時， IE 也想盡各種方式讓自己生存下去。

Javascript Patterns 在 2010 年出版，介紹了很多當時在開發中常見的問題以及處理方式：也就是所謂的 Pattern。雖然裡面範例的語法每個都是目前 EcmaScript 支援的標準，但看起來卻格外陌生，尤其是已經比較少接觸的 prototype，還有不使用 import/export 來做到的 module 實現(import/export 是 ES6 語法)。

Conditional comment 就是在那個時代下出現的功能，這個標準從 IE5 (1995) 的時候開始出現，而最後從 IE10 開始不再被支援。這篇文章就讓我們看看這時代的眼淚：Conditional comment

## 語法

Conditional comment 有兩種形式：downlevel-hidden 以及 downlevel-revealed。簡單來說：

- downlevel-hidden：只有 IE 中，才會解析 comment 中的內容
- downlevel-revealed：只有 IE 中，才會忽略 comment 中的內容

除了兩種形式之外，conditional comment 會包含一段 assertion，只有 assertion 為 true，才會解析其中的內容，下面是 wiki[^wiki] 中，downlevel-hidden 的範例

```html
<!--[if IE 8]>
<link href="ie8only.css" rel="stylesheet">
<![endif]-->
```

顯然這在 HTML 的中是一段註解(可以看到上面的 syntax highlight 是灰色的，代表註解)，但如果是在 IE5~IE9，上面的程式碼在 Conditional comment 中能被識別，而且當符合 assertion，也就是如果瀏覽器為 IE8 時，comment 中的內容就會被解析，因此會載入 `ie8only.css`。

範例中的的功能其實很類似 `<link>` 的 `media` 屬性，但 media query 並不能識別瀏覽器，所以如果要使用 media 屬性來判斷瀏覽器，只能透過獨有的屬性來識別是不是 IE (可以參考[How to target only IE (any version) within a stylesheet?](https://stackoverflow.com/questions/28417056/how-to-target-only-ie-any-version-within-a-stylesheet))。

而另外一種形式： downlevel-revealed 的邏輯比較繞(改寫了一下 wiki [^wiki]上面的例子)：

```html
<![if !(IE 8)]>
<link href="non-ie8.css" rel="stylesheet">
<![endif]>
```

如果不是 IE，因為 `<![if !IE]>` 以及 `<![endif]>` 並不是合法的 HTML tag，所以會被忽略，自然就會載入 `non-ie8.css`，可以看成下面這樣的形式

```html
<link href="non-ie8.css" rel="stylesheet">
```
但如果在 IE 中，assertion 就會被解析，如果不是 IE8 的瀏覽器同樣會載入 `non-ie8.css`，是的話，conditional comment 的內容將不會被解析。

有趣的地方是，因為上面的形式有非法的 HTML tag，如果要變成合法的 HTML tag，但又有 conditional comment 的效果，可以用下面的語法：

```html
<!--[if IE 6]><!-->
This code displays on non-IE browsers and on IE 6.
<!--<![endif]-->
```

這樣的語法可以分兩個層面來看：

如果是非 IE 的瀏覽器：因為 `<!--[if gt IE 6]><!-->` 和 `<!--<![endif]-->` 都是合法的註解，所以會被忽略，html 的內容自然會顯現

:::info
只要是在 `<!--`, `-->` 內部就會被視為註解

參考自：[whatwg - htmlcomments](https://html.spec.whatwg.org/multipage/syntax.html#comments)
:::

但如果是 IE 的瀏覽器：一樣包含 　`[if !(IE 8)]` 和 `[endif]`（這裡可能有問題[^qa]），所以會被解析為 conditional comment 的語法
  - 如果是符合 assertion 的 IE，也就是 IE 6。就可以看作
  ```html
  <!-->
  This code displays on non-IE browsers and on IE 6.
  ```
  - 但如果不符合 assertion 的 IE，內部就會被忽略，可以看作下面的語法，但仍然是和法的 HTML：
  ```
  <!--[if IE 6]>
  <!--<![endif]-->
  ```

另外，assertion 的內容也相當的多樣化，除了單一版本以外，還有各種 operator 可以使用，而且還支援嵌套。下面是 MSDN [^msdn]上的範例

```html
<!--[if IE]><p>You are using Internet Explorer.</p><![endif]-->
<![if !IE]><p>You are not using Internet Explorer.</p><![endif]>

<!--[if IE 7]><p>Welcome to Internet Explorer 7!</p><![endif]-->
<!--[if !(IE 7)]><p>You are not using version 7.</p><![endif]-->

<!--[if gte IE 7]><p>You are using IE 7 or greater.</p><![endif]-->
<!--[if (IE 5)]><p>You are using IE 5 (any version).</p><![endif]-->
<!--[if (gte IE 5.5)&(lt IE 7)]><p>You are using IE 5.5 or IE 6.</p><![endif]-->
<!--[if lt IE 5.5]><p>Please upgrade your version of Internet Explorer.</p><![endif]-->

<!--[if true]>You are using an <em>uplevel</em> browser.<![endif]-->
<![if false]>You are using a <em>downlevel</em> browser.<![endif]>

<!--[if true]><![if IE 7]><p>This nested comment is displayed in IE 7.</p><![endif]><![endif]-->
```

除此之外，甚至可以**指定 Windows 的版本**，十分難以想像當時的使用情境。


## Conditional Compilation Statements

但其實我在書上看到的並不是這種形式，而是像下面這樣寫在 JS 裡面的 comment

```html
<script>
  /*@cc_on
  document.write("You are using IE4 or higher");
@*/
</script>
```

這樣的語法在 Javascript 中，就只是單純的註解而已，但在 JScript 中不是單純的註解，而是可以被解析的內容，這樣的語法稱作 Conditional Compilation Statements[^JScript]

而 JScript 也正是利用這樣的特性，讓內容只在 IE 上被執行，和 conditional comment 相似的是，Conditional Compilation Statements 也能夠指定 JScript 的版本，甚至還可以指定只在 statement 內作用的變數。不過這部份就不多提，有興趣的可以看參考資料

:::info
ECMAscript 是標準，我們現在提的 Javascript 這種語言通常說的是符合 ECMAscript 的實現(implementation)，例如當初 Netscope 的 Javascript 以及 chrome V8 engine 的 Javascript 實現。而其他非 Javascript 的 ECMAscript 實現包含 ActionScript, JScript
:::

## 現狀

2012.9.4 開始，IE10 開始支援 HTML5，而 conditional comment 本身與 HTML5 的標準不相容[^JScript_blog]，所以 conditional comment 這個標準也被拔掉了。

當然，在十年後的今天，IE 也已經在 2022.6.15 開始不再被支援，相信這東西未來也不會在遇到了 🙃。

![RIP IE](/assets/images/post/20220914_conditional-comment_225526.png)  





[^js_patterns]: [Javascript Patterns](https://g.co/kgs/ZGGkB7)
[^JScript_blog]: [archive: MSDN blog - HTML5 Parsing in IE10](https://web.archive.org/web/20110708183158/http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx)

[^msdn]: [MSDN - About conditional comments](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/ms537512(v=vs.85)?redirectedfrom=MSDN#syntax-of-conditional-comments)
[^JScript]: [archive: JScript 8.0: Conditional Compilation Statements ](<https://web.archive.org/web/20081013175900/http://msdn.microsoft.com/en-us/library/7kx09ct1(VS.80).aspx>)
[^wiki]: [wiki - Conditional comment](https://en.wikipedia.org/wiki/Conditional_comment)

[^qa]: 不太確定 parser 是解析 `<![if !(IE 8)]>` 為 conditional comment 的語法，還是單單 `[if !(IE 8)]` 就有效果，只是為了要符合 xml 標準。找不到 IE5 HTML parser 的文件