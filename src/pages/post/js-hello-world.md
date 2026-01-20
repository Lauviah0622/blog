---
title: What JS is or not？ 1. Hello world
pubDate: 2025-09-26T00:00:00.000Z
tags:
  - javascript
layout: /src/layouts/Post.astro
draft: true

---

稍微列一下不同語言的 Hello world，就能發現的特別之處

shell script 
```shell
#!/bin/bash
echo "Hello World"
```

C

```c
#include <stdio.h>  
  
int main() {  
printf("Hello, World!\n");  
return 0;  
}
```

Python

```python
print("Hello, World!")
```

Kotlin

```kotlin
fun main() {  
    println("Hello, World!")  
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
    fmt.Println("hello world")
}
```

JavaScript

```js
console.log('hello world')
```

首先，可以歸納幾個特徵


- 有些語言有個 main，有些沒有
    - 有 main：C, Kotlin, Java, go
    - 沒有 main：Shell, JS, Python
- 除了 JS 跟 Shell 以外，大部分都有用了某個有 `print` 關鍵字的的 method
    - 有些 method 放在某個「namespace」裡面（這裡用中性的 namespace 來取代 object 等等 language specific 的用詞）。意味著 method calling 前面有個 `.` 
- 有些有引入 library，有些沒有
    - 有 library：go, Java, C
    - 沒有 library：JS, Python, Shell, Kotlin


我們從 main 開始聊起，就像一個應用程式會從 main 開始執行

不論你有沒有寫過這些語言，上面提到的 C, Java, Go 的程式碼，都能知道會從 main 開始執行，中間作些有的沒的，正常會在 main 結束（好，當然也有可能作 I/O loop，總之就是你知道的那回事）。

用比較程式的說法：main 是整個 Application 的 entry point （入口點）

那沒有 `main` 的語言呢？採用了另一套模式，就像我們在紙上寫文章，寫故事 (scripting) 同樣的邏輯：「由上至下」

Shell, Python, JavaScript 正是這類風格的代表。從第一行開始執行，一行一行由上至下執行，直到結束。它沒有 main 作為 entry point。或者可以從另一個角度來看，執行的「檔案本身」就是程式的 entry point。

|| #todo 補充下面的附註讓他更

```
# Python **其實也有 main，但只是以 module 為單位**：

`if __name__ == "__main__":     main()`

它不是語言強制，而是社群慣例。
```

Python 在設計之初就把易寫性作為核心哲學，而這樣由上至下的執行方式正是重要的實踐之一，比起 `main`  作為 entry point 更加直覺。Python 設計之初的使用情境就是：

> 「比 Shell 更強，比 C 開發更快，寫系統腳本超讚」

它作到了，well done！

反觀我們的主角 JavaScript ，也同樣使用由上至下的設計，但脈絡就沒 Python 這麼優雅和理想了

1995 年，Netscape 和 Sun 合作，準備把 Java 放進新一代瀏覽器 Navigator 2.0 。但 Netscape 發現，對於想要作一些簡單互動的設計師而言，Java 實在太過沈重；除此之外，他們也不希望整個瀏覽器的互動被 Java 壟斷。於是決定在同版本加入一種輕量、但語法與 Java 類似的腳本語言。

當時的簡單互動大概像這樣： [Melon's TOWN](https://melonking.net/melon?z=/town/)

這個重要的任務交給 4 月才到職的 Brendan Eich，然而 Navigator 2.0 的 feature freeze 時程早就確定了：十天後，他需要做出第一版的 prototype。

ref: [A brief history of JavaScript | Deno](https://deno.com/blog/history-of-javascript)

> 上帝花了 7 天造人；JS 不遑多讓，Brendan Eich 花了 10 天

比起 Python 優雅的設計哲學，JS 完全是商業壓力驅動的產物。不同的動機產生的語言卻有了微妙的共通點

- Python 想做到讓開發清楚、好維護
- JavaScript 是希望有個輕量的語言，讓設計師作互動

兩者都希望能夠簡化當時程式開發（使用 C, C++, Java 等等）的複雜度，而所謂的沒有 main 只是其中一個特性而已。你不需要去操作記憶體，不需要去知道所謂的「型別」，也不想知道 string 到底被儲存成什麼樣的 0 跟 1。兩個語言在蘊含著同樣的品味：

> 開發者能用更接近自然語言的方式來表達意圖

1994 年 1 月 27 日， Guido van Rossum 在郵件群組中發布 Python 1.0.0 時，很興奮的寫著：

ref: [Python 1.0.0 is out!](https://groups.google.com/g/comp.lang.misc/c/_QUzdEGFwCo/m/KIFdu0-Dv7sJ)

> Maybe you should try Python, the next generation object-oriented  scripting and prototyping language, with a *readable* syntax.


隔幾年，1997 年 6 月，當時 JS 的 ES1 標準上寫著 ，JavaScript 本來就是被設計為腳本語言作使用的：

> ECMAScript was originally designed to be a Web scripting language, providing a mechanism to enliven Web pages in browsers and to perform server computation as part of a Web-based client-server architecture.
> 
> ECMA-262, 1st edition, June 1997

兩個語言都有著共同的 Scripting language style 的風格，一個是精心設計的哲學實現，另一個則是商業策略的產物。這也注定了這兩者同樣是抽象程度相當高的語言，未來卻有截然不同的應用情境。

接下來，讓我們進入另一個有趣的發現：

> 什麼是 `print`？為什麼 JS 沒有所謂的 `print`，只有 `console.log`？


## Print ？ Console？ log？

print 通常是幾乎所有程式語言都會內建的 method，功能是把程式中的值，透過 I/O 呈現在  CLI (Command line Interface) 上面。白話文來說就是這個：

![[Pasted image 20251128001706.png|800]]



![[Pasted image 20251128002019.png | 500]]

JS 是跑在 Browser 的，怎麼會有 CLI 呢？所以 JS 的 `Hello world` 不同，是顯示在瀏覽器 devTool 中的（先不提 Node.js 等其他 runtime）。但實際上 `console.log` 和所謂的 `print` 有更根本性的差異。

首先，一個語言的「標準」（language standard）通常包含以下三個部分：
- 語言本身的規格（Language Specification）
- 標準函式庫（Standard Library Specification）
- 依語言而定，可能包含 VM 、runtime  或 compiler 等行為的規範

|| #todo 這裡加上一張圖


python 的 `print` ，就如同大部分的語言，是屬於[標準函式庫定義的方法](https://docs.python.org/3/library/functions.html#print)。大部分的語言的標準函式庫都會實作類似 Print 的方法。這類的方法實際上是將程式中的值格式化後寫入到 OS 的 stdout stream，而 stdout 預設會綁定在 Terminal 上，所以才會在 CLI 介面上看到 print 出來的值，但也可以透過 pipe 輸出到其他 input。

而 console.log 就不是這麼一回事了。我們可以從 `Console` 是什麼開始聊起。

Console 在 1990s 時期，常被用在各種開發的 IDE 裡面。作為顯示錯誤訊息的視窗，而 Netscape Navigator 在 1996 年就在瀏覽器加入類似的功能，稱作 JAvascript Console

ref: [Netscape Debugging](https://www.yaldex.com/javascript_tutorial_3/LiB0072.html)

![[Pasted image 20251128112032.png | 500]]

![[Pasted image 20251128112302.png | 500]]

當時還有另一個 JavaScript Debugger，而這也是現代 Devtool 的前身

![[Pasted image 20251128112403.png | 500]]

而真正要標準化 `console.log` 這個方法，則來到了 2006 年的 firebug 了。

ref: [A (brief) history of DevTools for the web. What am I missing? - 1993: The web launched with View Source and alert(). - 1999: console.log is introduced in Netscape’s JavaScript Console. - 2002:… | Jonathan Kuperman](https://www.linkedin.com/posts/jonkuperman_a-brief-history-of-devtools-for-the-web-activity-7267284630473433090-mAMo/?utm_source=chatgpt.com)

為什麼使用 `log` ，而不是 print 呢？剛剛有提到，`print` 這個 method 是一種 I/O，除了輸出到 Terminal 上以外，並能作為其他程式的 input。但在瀏覽器上就不是這麼一回事了，只是把資訊呈現在開發工具而已，比起 `print` 已經有了既定的語意在程式開發領域，`log` 這個詞早已經有了「紀錄資訊」這個語意，更適合在 Console 這個情境。

雖然兩者都會在程式語言的的教學中出現，但使用的方法在意義上卻完全不同

> print 是語言定義的 I/O，console.log 是平台提供的 Debug API

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

延續上面提到的 console.log。FireBug 是當時的一套 web 的開發工具，能作為 Firefox 的 extension 使用。現代全域的 console ，以及裡面的方法，像是常見的 `console.log`, `console.info`, `console.error` 等，都是在 Firebug 才被第一次標準化。在此之間，只有一些除錯工具以及部分瀏覽器有內建類似的工具，或者回去使用 `alert()` 之類的方法。

隨後其他瀏覽器也跟上這樣的方式，像是 Chrome, Safari, Opera 的內建 Devtool。然而這都只是各自實作而已，直到 WHATWG 在 2007 年，開始著手關於 console 的草案，但直到2014 年，才將各瀏覽器的實作整理並完整加入到 HTML Living Standard 裡面。

到這裡都只是瀏覽器而已，2009 年，Node.js 把 JavaScript 帶入 Server side 的世界。Node.js 配合瀏覽器既有的 debug 介面，也引入了 console API，降低原本會使用 JS 開發者進入後端的門檻。


而這也是 JavaScript 開始侵略世界的起點。


|| 這段要再串回整篇 Hello world 的東西，還有另外一份是要串到下一個篇章：SJ 的




---


從起點開始


|| 這篇文章沒有講到核心思想：覺得在這篇文章想開始帶入的概念是，JS 是極為抽象的語言（可以從 sepc 看到），並且依賴著宿主 （從 console log 那邊提到）。console.log 跟 瀏覽器的歷史是為了方面解釋上面那兩點的包裝

|| 上面這個東西可以從 JS 語言的 spec 去講

[ChatGPT - ECMAScript模糊性解析](https://chatgpt.com/s/t_6943bd88c4788191ac93bfc8fcf33816)

附註： 
- 其實在這篇文章很大程度的繞過了 C 的特殊性，在語言與平台的關係以及哲學上，C 跟 JS 很像。但我還沒有能力去談論這個主題







