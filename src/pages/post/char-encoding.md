---
title: 簡單聊聊字元編碼 Character Encoding
pubDate: 2024-08-25T00:00:00.000Z
tags:
  - misc
author: Lavi
layout: /src/layouts/Post.astro
---

## 「文字」是如何在電腦上面顯示的？

在電腦上，所有的東西都會被轉成 1 還有 0，文字也不例外。

文字在電腦上儲存的方式沒有想像的複雜，基本上也只是就是一個數字對一個字，想像一下

- 1 代表 a
- 2 代表 b
- 3 代表 c 
- ...

依照這個規律，如果我們要將 duck 這個英文單字編碼，那就會是

```
d: 4
u: 21
c: 3
k: 11
```


這種將文字轉換成某個集合的方式就稱為字元編碼（character encoding）。上面範例編碼方式將英文的小寫字母轉換成數字，數字又可以在依照不同的需要使用不同的格式（例如十進位或者是二進位）。

## ASCII

了解了什麼是編碼，我們可以看一下 ASCII ，一種被廣泛使用的編碼方式。下面是 ASCII 的 encoding table

![](/assets/images/post/20240825_char-encoding_1.png)

一樣用剛剛的 duck 來作範例，當你使用 ASCII 編碼時，會被轉換成

```
d: 100
u: 117
c: 99
k: 107
```

轉換成常見的十六進位則是

```
d: 0x64
u: 0x75
c: 0x63
K: 0x6B
```

ASCII 有幾個特點
- 包含的範圍有英文字母（大小寫）、符號、以及部分的控制字元，總共 128 個字元
- 128 個字元也同時對應到 7 個 bit，換句話說，儲存一個 ASCII 的字元需要 7bit 的空間
- 控制字元的位置是 0 ~ 31 以及 127 (DEL, 1111111)

:::info
控制字元是什麼？

控制字元並非顯示的文字或符號，而是對裝置下的指令。像是 換行（Line feed, LF）、刪除 (DEL) 等等。這些控制字元在過去對不同的裝置（像終端機, 印表機等）有各自不同的用處，但現在大部分不再被使用。
:::

 ## Terminology

了解了 ASCII，就可以說是了解字元編碼的基礎了。那再更進一步之前，可以先來聊聊一些術語以及定義。

### Character Encoding 字元編碼

Encoding 是一個很廣泛的概念，基本上把一套資訊轉換成另外一個形式的行為就可以稱作 encoding 編碼。不只是剛剛提到的文字轉換成數字，包含音訊、視訊等也都可以進行編碼。

在這篇文章則專注在 Character encoding，將 Character （字元）轉換成計算機可使用、傳遞的格式。

### 那什麼是 character（字元）

:::info
在這裡的 character 基本上是參考 Unicode standard 中的解釋

> Characters are the abstract representations of the smallest components of written language that have semantic value.
>
>字元是書寫文字中具有語意的最小組成的抽象表現
>
>The Unicode Standard, Version 15.0 -  2.2 Unicode Design Principles - Characters, Not Glyphs
:::


標準中的敘述有點抽象，但可以從幾個方向去思考什麼是字元。

在不同的時代，同樣一個 「人」字，可能有不同的書寫方式，但這些不同的書寫方式都表達了同樣的 「人」這個意思，所以不同朝代的人並不算不同的字元

![](/assets/images/post/20240825_char-encoding_2.png)

反過來，有沒有即使書寫方式相同，卻是被認為是不同字元的案例？

舉個例子[^13]，希臘文的 Σ 與數學符號的求和符號 ∑ （summation）兩者雖然書寫方式一樣，而且求和符號也的確是源自於希臘文的 Σ，但兩者使用至今已有不同的意涵，所以會被視為不同的字元。

上面都只是很簡單的舉例，但是事實上在 CJK （中文、日文、韓文中皆使用漢字，在這一議題上會簡稱為 CJK ）中，同一個文字在不同的文化中都不同，甚至還有異體字。最後這些也都被 Unicode 收錄為不同的字元

但撇除複雜的案例，一樣可以這樣理解：Character 字元是以意義為單位，來作為文字編碼、使用的最小元素

### 什麼是 code point？

code point (中文譯做碼點[^12]）表示在一套編碼中有多少的位置能夠用來表示字符。在剛剛的 ASCII 中就有 128 個 code points，而 Latin1 編碼則使用 8 個 bit ，也就是共 256 個 code points。而字元編碼中的一部分：character set （字及）很重要的一部分就是將字元對應到各自的碼點上。

### Code point 的位置就代表實際儲存的方式嗎？

非也，Code point 只是所謂的「位置」。實際儲存要考慮更多東西，大部分的編碼方式並不會直接以 code point 的位置儲存。例如 Unicode 在標準中，雖然字元對應到統一的 code point，但提供了三種不同的編碼方式：UTF-8, UTF-16, UTF-32。

## Wide characters 以及 Multibyte Characters

剛剛提到的 ASCII 是會使用 7 bits 的空間，但在大部分的系統中，都會使用 8 bit（使用 8 bit 非 7bit 會多出很多好處，存取記憶體時通常以 8bit 為單位），也就是一個 byte 來儲存一個 ASCII 的符號。


:::
事實上當然不可能用了 8bit，只放入 7bit 的 ASCII。有個常用的編碼標準是 Latin1，他完全相容 ASCII，並且擴充了幾個帶有變音符的字母，可以滿足大部分拉丁語族丁（也就是普遍認知的西方語言）的需要。
:::

但即使是使用了 1 個 byte，也僅僅只有 256 個 code points，對於亞洲國家的語言是完全不夠的。於此，有兩個作法（這兩個作法在 ANSI C standard C89 中有被明確的定義）可以解決這個問題，分別是 Wide characters （寬字元）以及 Multibyte Characters。

### Wide characters （寬字元）

這是一個很直覺的方法：

> 如果一個 byte 不夠，那就兩個

Wide characters 代表著
- 用多於 1 個 byte 的空間 來表示一個字
- 每個字都使用同樣的長度來表示

既然 8bit (1byte) 只能表示 256 個，那我們可以使用兩個 bytes ，那就能夠表示 65536 個字。

### UCS-2

了解了 Wide characters，我們來看看其中一個 Wide characters 的編碼標準 - UCS-2

UCS-2 使用 2 個 bytes 來作編碼，例如 剛剛舉的範例，在 ucs-2 中的編碼會是（以 Hex 16 進位來表示，以 byte 為單位）：

```
d: 0x00 0x64
u: 0x00 0x75
c: 0x00 0x63
K: 0x00 0x6B
```

那如果是更複雜一點的狀況呢？舉個例子，中文的 「鴨子」

```
鴨：0x9d 0x28
子：0x5b 0x50
```

既然同上所述，UCS-2 使用了兩個 bytes，所以 UCS-2 的 charset 可以表達總共 65536 個字，鴨子也不是生僻字，因此在 UCS-2 中完全沒問題。

那在到下一種文字之前，我們先插播一段愛在西元前

> 我給妳的愛寫在西元前 深埋在美索不達米亞平原  
> 用楔形文字刻下了永遠 那已風化千年的誓言 一切又重演

歌詞裡面提到楔形文字，那如果我要用楔形文字表達鴨子呢？UCS-2 無法表示楔形文字，因為楔形文字已經不再 UCS-2 能表示的字元中（UCS-2 僅能表示 Unicode 中 BMP 的字）
### Multibyte Characters

而另外一個作法比較特別，不一定要使用同樣的長度來表達每一個字，不同的字元會儲存成不同的長度

舉個例子，當表達 Latin1 可以表達的字母時，我們只需要使用 1 個 byte 來表示就好，但當需要表示例如漢字或者日文？就可以使用 2 byte 來表示

### UTF-8

上面同樣的範例，我們可以用 UTF-8 來表示看看差異

```
d: 0x64
u: 0x75
c: 0x63
K: 0x6B
```

```
鴨：0xE9 0xB4 0xA8
子：0xE5 0xAD 0x90
```

最後是楔形文字（以 Old Persian 書寫系統表示）
```
𐎣：0xF0 0x90 0x8E 0xA3
𐎸：0xF0 0x90 0x8E 0xB8
𐎢：0xF0 0x90 0x8E 0xA2
𐎪：0xF0 0x90 0x8E 0xAA
```

其中最大的差異就是，就如剛剛提到以 Multibyte Characters 方式編碼的 UTF-8 每個字元的編碼並不一定相同長度，而 UCS-2 則是每個字都相同。除此之外 UTF-8 可以表示褉型文字，但 UCS-2 不行。

## Wide Char 以及 Multibyte char 的優缺點

了解兩者差異，可以簡單來聊聊兩者的優缺點

- 花費的儲存空間：Multibyte char 在拉丁語族（也就是大部分人認知的西方語言）中效率高，因為可以用更少的空間表示。而 Wide ㄏhar 則沒有這個優勢
- 向後兼容：這是比你想像的還重要的一點，前面有提到 ASCII 是最被廣泛使用的編碼標準，而 UTF-8 可以完全兼容 ASCII，UCS-2 則需要另外轉換。這也是 utf-8 被廣泛使用在各種標準（例如 HTML5[^2], HTTP 的預設 charset[^3]）裡面的原因。
- 處理速度：Wide char 固定長度讓計算字串長度、解析都很方便。但 Multibyte char 就需要特殊處理。

綜上所述，可以得到比較簡單的結論：
- Wide char 比較適合在高效處理文字的場合
- Multibyte char 則是適合在需要兼容不同系統時使用

## Unicode 還有 Basic Multilingual Plane

剛剛有提到一個東西是 BMP (Basic Multilingual Plane)，這是什麼？

常提到的 Unicode 通常指的是 Unicode 聯盟所訂定的 Unicode standard，這個標準包含了所有在計算機上表示文字的所有要素。我們可以關注的有兩個部分

- 如何將文字編碼（也就是如果們一開始所做的，對應某個「數字」），只是規模大的多
- 這些編碼如何儲存，這樣的標準稱為 Unicode Transformation Format

Unicode 目前允許從  0x0 至 0x10FFFF 個 code points（碼位）。如果全部使用的話，總共可以儲存 1114111  個字。

當然，目前並沒有被完全使用，截至 2023 年九月收錄了總共有 149,813 個字[^5]，而這些字被放在不同的區域，這些區域也就是所謂的 Plane （平面）[^7]。一個 Plane 包含了 65535 個 code points，在 Unicode 中定義了 17 個 Plane。

![](/assets/images/post/20240825_char-encoding_3.png)

| 平面                 | 範圍                  | 中文名           | 英文名                                           |
| ------------------ | ------------------- | ------------- | --------------------------------------------- |
| 0號                 | `0x0000`至`0xFFFF`   | **基本多文種平面**，  | Basic Multilingual Plane，簡稱**BMP**            |
| 1號                 | `0x10000`至`0x1FFFF` | **多文種補充平面**   | Supplementary Multilingual Plane，簡稱**SMP**    |
| 2號                 | `0x20000`至`0x2FFFF` | **表意文字補充平面**  | Supplementary Ideographic Plane，簡稱**SIP**     |
| 3號                 | `0x30000`至`0x3FFFF` | **表意文字第三平面**  | Tertiary Ideographic Plane，簡稱**TIP**          |
| 4號  <br>至  <br>13號 | `40000`至`DFFFF`     | （未啓用）         |                                               |
| 14號                | `0xE0000`至`0xEFFFF` | **特別用途補充平面**  | Supplementary Special-purpose Plane，簡稱**SSP** |
| 15號                | `0xF0000`至`0xFFFFF` | 保留作為私人使用區（A區） | Private Use Area-A，簡稱**PUA-A**                |
| 16號                | `0x100000`至`10FFFF` | 保留作為私人使用區（B區） | Private Use Area-B，簡稱**PUA-B**                |
搬運自 [wiki](https://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%B9%B3%E9%9D%A2%E6%98%A0%E5%B0%84#%E7%AC%AC%E5%8D%81%E5%9B%9B%E8%BC%94%E5%8A%A9%E5%B9%B3%E9%9D%A2)[^8]

每個不同的平面包含了不同語言的文字，其中值得關注的是 BMP 以及 SMP。

前面提到 UCS-2 因為使用 2 個 byte ，所以只能表示 65535 個字。這正是 Unicode 中 BMP 的範圍：從 0x0000 至 0xFFFF  。而剛剛提到的楔形文字以及現在流行的 Emoji 則是在 SMP （多文種補充平面） 中，是無法用單純的 UCS-2 來表示的。

:::
除了 Plain 之外，每個 Plain 之中還有實際依照不同文字系統來區分的 Block，例如注音符號就位於 `0x3100`至`0x312F` 的 Unicode Block “Bopomofo” 以及 `U+31A0` 至 `U+31BF` Unicode Block “Bopomofo Extended” [^9]
:::

前面把 UCS-2 講的很一文不值，但真的是這樣嗎？

## UTF-16 與 UCS-2

事實上，大部分人都不會接觸到純正的 UCS-2 編碼了[^11]。Unicode 官方提出的有三種編碼[^10]

- UTF-8
- UTF-16
- UFT-32

而其中 UTF-16 則能夠完整兼容前面提到 UCS-2 編碼。再一次舉剛剛的例子

```
d: 0x00 0x64
u: 0x00 0x75
c: 0x00 0x63
K: 0x00 0x6B
```

```
鴨：0x9d 0x28
子：0x5b 0x50
```

最後是「楔形文字」的鴨子，在 UTF-16 中的表示是

```
𐎣：0xD8 0x00 0xDF 0xA3
𐎸：0xD8 0x00 0xDF 0xB8
𐎢：0xD8 0x00 0xDF 0xA2
𐎪：0xD8 0x00 0xDF 0xAA
```

作為一種 Multibyte character，UTF-16 的 code points 能夠表示超出 BMP 範圍的文字（包含了 1112064 個 code points）。這也是 UTF-16 可以成為廣泛兼容標準的一個因素。

## UTF-32

UTF-32 和 UTF-8、UTF-16 不同，則使用 Wide characters，所有的字元都是同樣的寬度。同樣的範例在 UTF-32 中的表示法如下

```
d: 0x00 0x00 0x00 0x64
u: 0x00 0x00 0x00 0x75
c: 0x00 0x00 0x00 0x63
K: 0x00 0x00 0x00 0x6B
```

```
鴨：0x00 0x00 0x9d 0x28
子：0x00 0x00 0x5b 0x50
```

最後是「楔形文字」的鴨子，在 UTF-16 中的表示是

```
𐎣：0x00 0x01 0x03 0xA3
𐎸：0x00 0x01 0x03 0xB8
𐎢：0x00 0x01 0x03 0xA2
𐎪：0x00 0x01 0x03 0xAA
```

## Conclusion

這篇文章對字元編碼進行了很基本的介紹，下一篇會更深入介紹一些編碼標準、以及一些源自於編碼的字串處理問題。

[^2]: [HTML Standard](https://html.spec.whatwg.org/multipage/semantics.html#charset)
[^3]: [RFC 7231 - Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231#appendix-B)
[^4]: 來自  [UnicodeStandard-15.0](https://www.unicode.org/versions/Unicode15.0.0/UnicodeStandard-15.0.pdf) - 2.2 Unicode Design Principles
[^5]: 來自  [Unicode 15.1.0](https://www.unicode.org/versions/Unicode15.1.0/)
[^6]: [Glossary - code_point](https://unicode.org/glossary/#code_point)
[^7]: [Glossary - plane](https://unicode.org/glossary/#plane)
[^8]: [Unicode字符平面映射 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%B9%B3%E9%9D%A2%E6%98%A0%E5%B0%84#%E7%AC%AC%E5%8D%81%E5%9B%9B%E8%BC%94%E5%8A%A9%E5%B9%B3%E9%9D%A2)
[^9]: [Unicode Block “Bopomofo”](https://www.compart.com/en/unicode/block/U+3100), [Unicode Block “Bopomofo Extended”](https://www.compart.com/en/unicode/block/U+31A0)
[^10]: [UnicodeStandard-15.0](https://www.unicode.org/versions/Unicode15.0.0/UnicodeStandard-15.0.pdf) 2.5 Encoding Forms
[^11]: [Unicode - Wikipedia](https://en.wikipedia.org/wiki/Unicode#Mapping_and_encodings) : UCS-2 is an obsolete subset of UTF-16
[^12]: [NAER Web of Words : 碼點](https://terms.naer.edu.tw/detail/636cb54214795e7dd5b1c7d3e80a429e/?seq=1)