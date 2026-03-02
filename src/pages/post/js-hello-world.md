---
title: What JS is or not？ Ep.1 Hello world
pubDate: 2026-02-28T00:00:00.000Z
tags:
  - javascript
layout: /src/layouts/Post.astro
draft: true

---



下面有幾個不同的 Hello World

看著文章的你，不一定認識這些語言。但寫 code 那麼久，光看語法本身，能夠了解不同語言中的每一個元素可能在作些什麼嗎？

Shell

```shell
#!/bin/bash
echo "Hello, World"
```

C
```c
#include <stdio.h>  
  
int main() {  
printf("Hello, World\n");  
return 0;  
}
```

Python

```python
print("Hello, World")
```

Kotlin

```kotlin
fun main() {  
    println("Hello, World")  
}
```

Java

```java
public class HelloWorld {
    public static void main(String[] args)
    {
        System.out.println("Hello, World");
    }
}
```

go

```go
package main
import "fmt"
func main() {
    fmt.Println("Hello, World")
}
```

最後是，JavaScript

```js
console.log('Hello, World')
```

Hello World 是最簡單的程式碼，也是每個「程式語言」的入門磚。各個語言都有自己的特色，Hello World 也當然有所不同。但拋開複雜的語法或 API 操作，單單就「字面」而言，差異在哪裡？可以先歸納幾個特徵：

- 有些語言有個 main，有些沒有
    - 有 main：C, Kotlin, Java, go
    - 沒有 main：Shell, JS, Python
- 除了 JS 跟 Shell 以外，大部分都有用了某個有 `print` 關鍵字的的 method
    - 有些 method 放在某個「namespace」裡面（這裡用中性的 namespace 來取代 object 等等 language specific 的用詞）。意味著 method calling 前面有個 `.` 
- 有些語法上需要引入 library ，有些沒有
    - 有引入：C, go
    - 沒有引入：JS, Python, Shell, Kotlin

從哪裡開始聊起呢？就像一個應用程式會從 main 開始執行，我們也從 main 這點開始好了。

不論你有沒有寫過這些語言，上面提到的 C, Java, Go 的程式碼，都能知道會從 main 開始執行，中間作些有的沒的，正常會在 main 結束（好，當然也有可能作 I/O loop，總之就是你知道的那回事）。

用比較 nerdy 的說法會是：main 是整個 Application 的 entry point （入口點）

那沒有 `main` 的語言呢？採用了另一套模式，就像我們在紙上寫文章，寫故事 (scripting) 同樣的邏輯：「由上至下」

Shell, Python, JavaScript 正是這類風格的代表。雖然不精準，但我們姑且可以稱這類的程式語言叫做腳本語言 (scripitng language) ，而這樣的模式是這類語言的特色之一：從第一行開始執行，一行一行由上至下執行，直到結束。它沒有 main 作為 entry point。或可以從另一個角度來看，執行的「檔案本身」就是程式的 entry point。

但這樣的風格代表著什麼？這關乎到語言設計之初的定位。

Python 在設計之初就把易寫性作為核心哲學，而這樣的執行方式正是重要的實踐之一，比起 `main`  作為 entry point ，腳本式的寫法更加直覺。最初使用情境就是：

> 「比 Shell 更強更簡單，比 C 開發更快，寫系統腳本超讚」

它作到了，well done！除了執行方式之外
- python 在執行時大多不需要預先編譯
- 語法上減少符號的使用
- 使用縮排作為語法區塊
- 包含大量常用好用的內建庫
- 等等...

上面這些都是為了當初作為「腳本語言」的特性，是非常優秀而友善的設計。

反觀我們的主角 JavaScript ，也同樣使用腳本語言中，由上至下書寫的風格，但脈絡就沒 Python 這麼優雅和理想了。

### How JS is？

1995 年，Netscape 和 Sun 合作，準備把 Java 放進新一代瀏覽器 Navigator 2.0 。但 Netscape 發現，對於想要作一些簡單互動的設計師而言，Java 實在太過沈重；除此之外，他們也不希望整個瀏覽器的互動被 Java 壟斷。於是決定在同版本加入一種輕量、但語法與 Java 類似的腳本語言。

當時希望讓設計師能做到簡單互動大概像這樣： [Melon's TOWN](https://melonking.net/melon?z=/town/)

這個重要的任務交給 4 月才到職的 Brendan Eich，然而 Navigator 2.0 的 feature freeze 時程早就確定了：十天後，他需要做出第一版的 prototype。

ref: [A brief history of JavaScript | Deno](https://deno.com/blog/history-of-javascript)

> 上帝花了 7 天造人；JS 不遑多讓，Brendan Eich 花了 10 天

比起 Python 優雅的設計哲學，JS 完全是商業壓力驅動的產物。如此不同的動機下產生的語言卻有了微妙的共通點：

- Python 想做到讓開發清楚、好維護
- JavaScript 是希望有個輕量，簡便的語言，給設計師作網頁的互動

兩者都希望能夠簡化當時程式開發（使用 C, C++, Java 等等）的複雜度，你不希望寫個小互動還要去操作記憶體，不想知道到底「數字」要存成什麼。腳本語言則是這樣的背景發展出來的類型與風格，重心應該放在「簡單的描述想完成的操作」。

類似的出發點，讓 Python 跟 JavaScript，不謀而合的有著著同樣的品味：

> 開發者能用更接近自然語言的方式來表達意圖

1994 年 1 月 27 日， Guido van Rossum 在郵件群組中發布 Python 1.0.0 時，很興奮的寫著：

ref: [Python 1.0.0 is out!](https://groups.google.com/g/comp.lang.misc/c/_QUzdEGFwCo/m/KIFdu0-Dv7sJ)

> Maybe you should try Python, the next generation object-oriented **scripting** and prototyping language, with a *readable* syntax.
> 
> 也許你應該嘗試 Python -- 一款具備可讀性語法的次世代物件導向、腳本與原型設計語言

而過了幾年來到 1996 ，當時為了跟微軟的 JScript 競爭，Netscape 選擇了 ECMA 來幫 JavaScript 制定標準，而隔年的 6 月，TC39 便光速的發佈了第一版的 ECMA-262，JS 進入標準化的時代（但還是一片混沌），而標準上寫著 ：

> ECMAScript was originally designed to be a **Web scripting language**, providing a mechanism to enliven Web pages in browsers and to perform server computation as part of a Web-based client-server architecture.
> 
> ECMAScript最初是作為網頁腳本語言設計的，旨在提供一種機制，使網頁能在瀏覽器中動態呈現，並作為基於網頁的客戶端-伺服器架構的一部分執行伺服器端運算。
> 
> ECMA-262, 1st edition, June 1997

兩個語言都有著同樣腳本語言的風格，但一個是精心設計的哲學實現，另一個則是商業策略的產物。這也注定，雖然兩者同樣是抽象程度相當高的語言，也有著類似的「味道」，但在應用方面，未來的發展卻截然不同。

了解了一點 JS 的歷史，我們好像更知道為什麼會是這樣的寫法。但接下來，我們將進入另一個有趣的發現：

> 什麼是 `print`？為什麼 JS 沒有所謂的 `print`，只有 `console.log`？ `console` 是什麼？是 library 嗎？

但我們先從其他語言開始，這樣才能了解 JS 的有趣之處。就從什麼是「print」開始吧
## What the `print` is？

print 通常是幾乎所有程式語言都會內建的 method，功能是把程式中的值，呈現在  CLI (Command line Interface) 上面。簡單說就是這個：




`print` 看起來只是簡單的東西印出來，但裡面作的事情，比你想像的複雜很多。大致的步驟會是

1. 序列化：把程式內部的「值」轉成字串後，進行編碼
2. 輸出：把編碼後的結果寫入到設定好的「輸出通道」

每個語言都有不同的資料型別，在序列化的過程中，會將這些資料型別：可能是 float, integer, pinter, function... 任何一種資料，嘗試轉換成「可顯示的文字表示」。再來，每個語言、每個程式中，表示「文字」的方式是不同的，需要把程式中的「文字」轉換成作業系統可以處理 bytes 資料格式，例如 UTF-8 等。

當你使用 CLI 介面執行程式時，預設的輸出的管道（stdout）就已經會接到你的 terminal 上。而程式會把前面準備好的 bytes 「寫入」到這個輸出，最終讓我們看到「Hello World」。

是不是超級麻煩的 🧐 

不只有你這麼覺得，所以大部分的語言不會讓你自幹。不是內建，就是包在標準庫裡面。：

- C：[`stdio`](https://en.cppreference.com/w/c/io.html)
- JVM 系列 (Java / Kotlin) ：[`java.lang.System`](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/System.html#out)
- Go：[fmt](https://pkg.go.dev/fmt#Printf)
- Python：[built-in function](https://docs.python.org/3/library/functions.html#print)

那 JS 呢？這就複雜了，寫過 JS 的人都知道，這關乎你要在哪裡「執行」JS。如果你是在 Node.js 上執行，那的確下面的程式碼是可以直接執行的。

```js
console.log('Hello world')
```

但如果你想要在 Browser 執行，上面是不夠的。你需要完整的 `.html` 檔案。JS 是操作網頁行為的工具，所以要寫在 `script` 的 tag 裡面。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <script>
    console.log('Hello World')
  </script>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

寫過了這麼久的 JS，你不可能沒有用過 `console.log`

不論你處理的是 Server side ,  Browser 又或是 React Native 等其他平台。有些 API 是平台專屬的，例如瀏覽器上的 `document.addEventListener` ，又者是 `node.js` 的 `fs` 系列。但不論每個平台，我們都使用 `console.log` 來印出一些資訊，那難道 `console.log` 是語言提供的功能嗎？

來看看 `console.log` 是怎麼誕生的吧，可以說是我們最熟悉的陌生人了。

## The Birth of a `console.log`

在瀏覽器被發明之時，大概 1990 年代左右，當時的瀏覽器是沒有 debugger 的。或者說，為什麼要有？這是全世界的[第一個網站](https://info.cern.ch/)



是的。當初的網頁只有 HTML，沒有 CSS，也沒有 JS，那理所當然也不用 debug。網頁只是單純的渲染 HTML 語法而已。debug 這件事情，要直到網頁開始可以「互動」開始才有意義，也就是 JavaScript 誕生之後。而在當時，大家最常用的除錯工具有幾個，到現在也能夠運作：

- `alert()`：因為會強制停止執行，意外的蠻好用的
- `window.status`：當時的瀏覽器下方有個欄位，會顯示例如：是否 loading 中, `<a>` 的連結等，可以透過 JS 改寫欄位的資訊
- 直接改寫在 DOM 上，反正沒人在意 ：）



但這樣是不行的，不加上 alert，就完全不知道 JS 有沒有寫錯，甚至也不知道錯在哪裡。隨著應用複雜了起來，這樣的開發模式勢必會遇到了瓶頸。神說：「要有光」，就有了光；開發者說：「要有除錯工具啊！」，於是也有了除錯工具！當時的瀏覽器 Netscape Navigator / Microsoft IE 在推出 JS 之後，也紛紛推出一些工具。像是 Netscape 有個獨立的 JS Debugger。可以告訴你哪一行發生錯誤

ref: [Netscape Debugging](https://www.yaldex.com/javascript_tutorial_3/LiB0072.html)


IE 也有，但就是粗暴了點，直接跳一個 Dialog。而且這東西可不只開發者會看到而已，User 也會，很兇。


雖然只有行數和錯誤訊息，在當時已經是很大的進步了。雖然現代有著全套 devtool 的我們可能覺得：這是要除什麼東西？感覺大概像父母說以前都吃地瓜粥，但活在現在的我心理卻想著：「何不食肉糜？」。

Netscape 死掉後。繼承者 Mozilla Foundation 決定全部重來，推出了 Mozilla Suite 的瀏覽器套裝軟體，而其中就有作為 Debug 工具的 venkman。但真的讓 debug 的體驗接近到現在的 devtool，要來到 2006 。在這年，狐火化作螢火蟲，點亮了開發者的世界：Firebug 作為 Firefox 的其中一個 extension 推出了。

Firebug 的推出顛覆了開發者的體驗，現在你常用的所有 devtool 工具幾乎都源自於 Firebug：

- DOM inspector
- Network panel
- CSS styling
- Console (JavaScript REPL)

而我們文章的主角：`console.log` 也是從 Firebug 誕生的。在當時，各家瀏覽器都實作了自己的 `console` API，作為除錯使用。但我們常用的 `console.log`, `console.info`, `console.warn`, `console.error` 這些 API，是直到 Firebug 出現的。搭配工具中的 Console panel，讓前端可以直接一邊運作，一邊操作頁面的內容還有修改值，讓開發體驗上升了不只一個量級，也讓前端可以開發更加複雜的應用。

這個功能出現之後，不只開發者回不去，JS 的生態也進入了另一個時代：2008 年 chrome 內建了 devtool，涵蓋了大部分 firebug 有的功能。隨後其他瀏覽器也跟上這樣的方式，開始內建類似的 API 以及 devtool。然而這都只是各自實作而已，直到 WHATWG 在 2007 年，開始著手關於 console 的草案，但一直到2014 年，才將各瀏覽器的實作整理並完整加入到 HTML Living Standard 裡面。

到這裡，都還只是瀏覽器的世界而已。2009 年，Node.js 把 JavaScript 帶入 Server side 的世界。Node.js 配合瀏覽器既有的 debug 介面，也引入了 console API，降低原本會使用 JS 開發者進入後端的門檻。

[JavaScript: Firefox and Firebug | I'd Rather Be Writing Blog and API doc course](https://idratherbewriting.com/firefox-and-firebug-javascript/#:~:text=First%20install%20the%20Firebug%20extension,bottom%20of%20your%20browser%20window.&text=in%20the%20lower%2Dright%20corner,the%20pane%20into%20two%20panels.)


|| 然後這裡就可以解釋，為什麼是 console，然後為什麼是 Log
|| 後面回頭講：那這個 API 到底是什麼？隨著
|| 最後要回看一下，文章個部分不會太喧賓奪主，然後有些地方會不會太囉唆。
|| 了解了 為什麼用 log 而不是用 前面提到的 print => 因為這個本來就是用在 browser 的 API, 語言層並沒有 console.log。node 有其實是因為要兼容 browser 的 API 讓他更好 
|| 上面這些東西原本是拉到最後講的，其實好像也覺得不錯。然後從為什麼命名這件事情帶到 host / runtime 。但這個東西在 node 裡面，也不是像其他語言那樣是 Library...？JS 的 library 到底是什麼？
|| 但中間要怎麼接？應該是要講一下 JS 的 hello world 的觀察。
|| 1. JS 是腳本語言 => 這點好像不太重要
|| 2. console 是從 browser 開始的，然後 node 跟上 
|| 即使是在 node 
|| 3. print 是語言定義的 I/O，console.log 是平台提供的 Debug API <= 這個
|| 在後面要接到文章中最想講的東西：runtime 試什麼，host 試什麼（但這篇文章先不講 engine，那是下一篇要講的東西）
|| 但前面的例子也是要解釋後面講的東西



---


但其實開發還是挺辛苦的，這樣還是很難用


Console 在 1990s 時期，常被用在各種開發的 IDE 裡面。作為顯示錯誤訊息的視窗，而 Netscape Navigator 在 1996 年就在瀏覽器加入類似的功能，稱作 JAvascript Console


當時還有另一個 JavaScript Debugger，而這也是現代 Devtool 的前身



而真正要標準化 `console.log` 這個方法，則來到了 2006 年的 firebug 了。

ref: [A (brief) history of DevTools for the web. What am I missing? - 1993: The web launched with View Source and alert(). - 1999: console.log is introduced in Netscape’s JavaScript Console. - 2002:… | Jonathan Kuperman](https://www.linkedin.com/posts/jonkuperman_a-brief-history-of-devtools-for-the-web-activity-7267284630473433090-mAMo/?utm_source=chatgpt.com)

為什麼使用 `log` ，而不是 print 呢？剛剛有提到，`print` 這個 method 是一種 I/O，除了輸出到 Terminal 上以外，並能作為其他程式的 input。但在瀏覽器上就不是這麼一回事了，只是把資訊呈現在開發工具而已，比起 `print` 已經有了既定的語意在程式開發領域，`log` 這個詞早已經有了「紀錄資訊」這個語意，更適合在 Console 這個情境。

雖然兩者都會在程式語言的的教學中出現，但使用的方法在意義上卻完全不同

> print 是語言定義的 I/O，console.log 是平台提供的 Debug API


|| 這裡要加個圖



JS 是跑在 Browser 的，怎麼會有 CLI 呢？所以 JS 的 `Hello world` 不同，是顯示在瀏覽器 devTool 中的（先不提 Node.js 等其他 runtime）。但實際上 `console.log` 和其他語言的 `print` 有更根本性的差異。

|| 好像不應該先提這個，應該先提 print 這個東西到底本質在在 CLI 上輸出是幹嘛。然後再提 library 的東西， 再來可以導入 Browser 。這樣就可以講到「runtime」 是什麼。然後再講 JS 又在幹嘛

|| JS 的 hello world 要怎麼講？

首先，一個語言的「標準」（language standard）通常包含以下三個部分：
- 語言本身的規格（Language Specification）
- 標準函式庫（Standard Library Specification）
- 依語言而定，可能包含 VM 、runtime  或 compiler 等行為的規範

|| #todo 這裡加上一張圖


python 的 `print` ，就如同大部分的語言，是屬於[標準函式庫定義的方法](https://docs.python.org/3/library/functions.html#print)。大部分的語言的標準函式庫都會實作類似 Print 的方法。這類的方法實際上是將程式中的值格式化後寫入到 OS 的 stdout stream，而 stdout 預設會綁定在 Terminal 上，所以才會在 CLI 介面上看到 print 出來的值，但也可以透過 pipe 輸出到其他 input。

而 console.log 就不是這麼一回事了。我們可以從 `Console` 是什麼開始聊起。



## JS 以及「宿主環境」


但 `print` 以及 `console.log` 在 JS 中，除了平台以及命名由來的差異之外，背後更透露著 JS 從設計之初，到現在百花齊放之際，就從來沒有改變過的角色定位：

> 操作宿主環境 (Host environment）的內嵌語言

宿主環境這個專有名詞聽起來很陌生，但其實就是就是所謂的「平台」，下面各項你一定聽過

- 瀏覽器
    - Main browser：
    - Worker Host：Service Worker
- Server / CLI：deno, node.js, Bun...
- cloud function：Cloudflare Workers, AWS Lambda, Google Cloud Functions...
- Desktop App：Electron...
- Native App：React Native
- 嵌入式系統 / IoT
- App Embedded：AfterEffects, Photoshop （你沒看錯，就是那個 Adobe 家族，而且不是現代的網頁版）
- ...族繁不及備載

這麼多的平台，那 JS 的語言標準要如何像 python 一樣制定 `console.log` 這個方法的一致性？答案很簡單，ECMA-262 寫著

> Therefore the core language is specified in this document apart from any particular [host environment](https://tc39.es/ecma262/#host-environment).

語言規範根本沒有提到 `console.log`，那是宿主環境的事情。

> ECMAScript is now used to provide core scripting capabilities for a variety of [host environments](https://tc39.es/ecma262/#host-environment). 

JS 的語言標準只提到語言的核心規則本身，還有少到幾乎算沒有的標準函式庫 （那一點的 Math... 算嗎？），當然也不包含 VM, runtime 什麼的。其他的功能，像我們在討論的 `console.log` 這些通通是 宿主環境 (host environment) 的實作。對於 JS 這個「語言」而言，只是透過一個全域的物件，調用它的 method 而已，JS 的語言曾並不定義實際的 `console.log` 有哪行為。就舉上面的平台為例：

- 不論 Chromium, Safari, Firefox，在 Browser 的環境，console.log 都會輸出到 devtool。
- 在 Server side 的 runtime，雖然三者都會輸出到 stdout，跟 print 一樣，但是細節完全不同
- 在 React Native 中，會由 RN 的 runtime 可能依照 dev build / release build 來決定要送到哪裡，可能是 Devtool, Android logcat, Xcode debugger 等位置
- IOT 方面，Espruino 預設會輸出到串口序列埠（UART），可以讓 debugger 或者是其他的裝置作串接
- 在 cloud function，通常會記錄到 logging services 裡面
- 甚至，有些平台是不實作 console.log 的，這也是平台的自由

但他們也不是沒有共通點，雖然各有些微的差異不同，但所有的 `console.log` 都維持著相同語意：所有的平台都把 console.log 作為輸出除錯資訊的方法。

延續上面提到的 console.log。FireBug 是當時的一套 web 的開發工具，能作為 Firefox 的 extension 使用。現代全域的 console ，以及常見的 `console.log`, `console.info`, `console.error` 等，都是在 Firebug 才被第一次標準化。在此之間，只有一些除錯工具以及部分瀏覽器有內建類似的工具，大部分還是使用 `alert()` 之類的方式來印出值。

隨後其他瀏覽器也跟上這樣的方式，像是 Chrome, Safari, Opera 的內建 Devtool。然而這都只是各自實作而已，直到 WHATWG 在 2007 年，開始著手關於 console 的草案，但直到2014 年，才將各瀏覽器的實作整理並完整加入到 HTML Living Standard 裡面。

到這裡都只是瀏覽器而已，2009 年，Node.js 把 JavaScript 帶入 Server side 的世界。Node.js 配合瀏覽器既有的 debug 介面，也引入了 console API，降低原本會使用 JS 開發者進入後端的門檻。


而這也是 JavaScript 開始侵略世界的起點。


|| 這段要再串回整篇 Hello world 的東西，還有另外一份是要串到下一個篇章：SJ 的


|| 這篇文章要提要 runtime 這件事情。不然很難接


|| 這篇文章沒有講到核心思想：覺得在這篇文章想開始帶入的概念是，JS 是極為抽象的語言（可以從 sepc 看到），並且依賴著宿主 （從 console log 那邊提到）。console.log 跟 瀏覽器的歷史是為了方面解釋上面那兩點的包裝

|| 上面這個東西可以從 JS 語言的 spec 去講

附註： 
- 其實在這篇文章很大程度的繞過了 C 的特殊性，在語言與平台的關係以及哲學上，C 跟 JS 很像。但我還沒有能力去談論這個主題







