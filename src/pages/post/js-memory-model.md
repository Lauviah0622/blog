---
title: What JS is or not？ 1. Hello world
pubDate: 2025-09-26T00:00:00.000Z
tags:
  - javascript
layout: /src/layouts/Post.astro
draft: true

---

# 結構

先提個時間複雜度問題。找個例子，python 的 code 先出來，然後換成 JS。然後下引注：有意義嗎？

解釋 JS 的 Array 是什麼

然後解釋 ECMA 的標準：array 只是 Object，不定義時間複雜度，這裡可以跟 Python 作比較

這裡有個 Gap => 不知道怎麼接到 Object 那段

然後解釋整個 ECMA 的 JS 的 值到底有哪幾類，然後唯一的 reference 是 object


這個 object 造成哪些事情：

V8 的 detach, unstable memory saving modle
V8 能做的神奇優化

這裡要鑽深一點，hiddel class


最後找個 reddit / stackoverflow 的討論：JS 的效能迷思效能迷思，因為 runtime 不同，社群常常吵不完


bonus
- UI  framework 因為這個模型很麻煩
-  WebAssembly / TypedArray 的崛起（為什麼 JS 需要另一套 memory model？）
    - 因為如果要用在 AI / Gaming，需要更確定的 dat model

[Javascript Hidden Classes and Inline Caching in V8](https://richardartoul.github.io/jekyll/update/2015/04/26/hidden-classes.html?utm_source=chatgpt.com)

---

# 2. JS 的空間：Memory Model


記得在小時候剛學寫程式的時候。非常在意所謂的時間複雜度。能用 O(1) 寫的時候，就別用 O(n)，O(n^2) 更要特別注意。所以常常會想一下，有沒有更有效率的寫法？是不是要用更適合的資料結構，像是要用 Array，還是要用 `Object` 或 `Map`？

舉個常見 O(n^2) 的例子：有一群用戶，以及一堆訂單。我們需要讓每個用戶找到他們自己的訂單。這個問題基本上就是去遞迴「列表」的資料結構，來找出結果

理論上這種情形就會需要取捨時間複雜度跟空間複雜度。可能會用 Hash map 的結構，避免 O(n^2)，在 JS 可能會用 Object 或者是 Map，在 Python 就是 Dict。

下面是非常不嚴謹的 benchmark 跑出來的結果：

| JS (n users * n orders) | n = 1000 | n = 10000 | n = 100000 |
| ----------------------- | -------- | --------- | ---------- |
| with Array method       | ~0.0064s | ~0.0353s  | ~3.6s      |
| with Map method         | ~0.0002s | ~0.0011s  | ~0.0044s   |

| Python (n users * n orders) | n = 1000 | n = 10000 | n = 100000 |
| --------------------------- | -------- | --------- | ---------- |
| with Array linear search    | ~0.0152s | ~1.4740s  | ~166.2034s |
| with Map dict               | ~0.0002s | ~0.0018s  | ~0.2236s   |

這裡的重點並不是 JS 跟 Python 誰比較快，也不是 List 與 Hash map 之間的比較。當我們把隨便算算的比率加上去後，關係會更清楚

| JS (n users * n orders) | n = 1000 | n = 10000 | n = 100000 |     |
| ----------------------- | -------- | --------- | ---------- | --- |
| with Array method       | ~0.0064s | ~0.0353s  | ~3.6s      |     |
| ratio                   |          | ~60       | 100        |     |
| with Map method         | ~0.0002s | ~0.0011s  | ~0.0044s   |     |
| ratio                   | 1        | 5         | 4          |     |


| 可能要講用哪個版本？CPython 還是 Pypy？

| Python (n users * n orders) | n = 1000 | n = 10000 | n = 100000 |
| --------------------------- | -------- | --------- | ---------- |
| with Array linear search    | ~0.0152s | ~1.4740s  | ~166.2034s |
| ratio                       | <br>     | ~100      | ~100       |
| with Map dict               | ~0.0002s | ~0.0018s  | ~0.2236s   |
|                             |          | ~10       | ~1000      |


發現到了嗎？JS 的 benchmark 並不符合我們對於時間複雜度的認知模型。我們總是調整資料結構、改變演算法、使用不同的方法來完成我們「想像」中的效能優化，但相信大部分的人都沒有真正的去跑 benchmark 或者是 profiling（希望大家都可以看看 [The Mature Optimization Handbook](https://carlos.bueno.org/optimization/) 這本書）。或許我們應該反問我們自己的是：

> 你的優化在 JS 裡面真的有用嗎？沒用的話，原因是什麼？

從這個問題出發，延續上一章節 Hello world 。這個章節，我們開始聊聊 JS 的 Memory Model。


---

## 舉 List 為例：Python 的情況

![[Pasted image 20251208171448.png]]

從我們高階抽象層級語言的好夥伴，也是「善良」的程式語言代表  --- Python 開始說起吧。

在 [TimeComplexity - Python Wiki](https://wiki.python.org/moin/TimeComplexity) 裡面清楚的寫著
- append：O(1)
- pop last: O(1)
- insert：O(n)


雖然 Python 的語言規格本身並沒有定義 List 的時間複雜度，理論上這些可以由實作自行決定。但實際在 90% 以上的場景，大家都使用 CPython （Python 語言的其中一種實作，大家普遍下載的 python 事實上就是 CPython），這讓 Cpython 幾乎變成所謂的事實規格（de facto spec）。

而在 Cpython 中，List 的實作正是動態分配的連續記憶體，非常符合每一本大學教科書中對於 List 儲存的時間複雜度公式，我們的不準確的 benchmark 也體現了這點。

|| 感覺這裡有點太短?


## JS 語言層的執行模式

但反過來，我們的「邪惡」代表 -- JS ，在 JS 中，最貼近 List 的資料結構就是 Array 了，。對於計算機科學比較了解的同學，可能會想到底層可能會儲存成像 Python 一樣的連續記憶體，又或者是 Linked list 的形式。

我們先延續上一篇文章的重要結論：JS 的生態系由兩個很大的部分所組成，一個是 JS 的語言層，第二是宿主環境。在我們討論 JS 的資料格式時，一定需要同時探討這兩個層面，才有實質的意義。


從語言層開始，老話一句，我們還是可以先從 ECMA 的標準開始看起，下面是敘述 Array 的行為：

> An Array is an [exotic object](https://262.ecma-international.org/16.0/index.html#exotic-object) that gives special treatment to [array index](https://262.ecma-international.org/16.0/index.html#array-index) [property keys](https://262.ecma-international.org/16.0/index.html#property-key) (see [6.1.7](https://262.ecma-international.org/16.0/index.html#sec-object-type)). A property whose [property name](https://262.ecma-international.org/16.0/index.html#property-name) is an [array index](https://262.ecma-international.org/16.0/index.html#array-index) is also called an _element_.
> 
> [ECMA-262, 16\<sup\>th\</sup\> edition, June 2025\<br\>ECMAScript® 2025 Language Specification](https://262.ecma-international.org/16.0/index.html#sec-array-exotic-objects)

語言標準寫的文鄒鄒的，這裡先解釋幾個專有名詞：

> [Exotic Object](https://262.ecma-international.org/16.0/index.html#exotic-object)：An exotic object is an object that is not an [ordinary object](https://262.ecma-international.org/16.0/index.html#ordinary-object).

這裡的 Exotic 沒什麼性感、曖昧的意思（想色色？），只是單純的「非原始 Object」的意思。

> [Array Index](https://262.ecma-international.org/16.0/index.html#array-index)：An array index is an [integer index](https://262.ecma-international.org/16.0/index.html#integer-index) n such that [CanonicalNumericIndexString](https://262.ecma-international.org/16.0/index.html#sec-canonicalnumericindexstring)(n) returns an [integral Number](https://262.ecma-international.org/16.0/index.html#integral-number) in the [inclusive interval](https://262.ecma-international.org/16.0/index.html#inclusive-interval) from +0𝔽 to [𝔽](https://262.ecma-international.org/16.0/index.html#%F0%9D%94%BD)(2^32 - 2).

但搭配上面前面的描述，我們可以知道

> Array 基本上只是一種 Object ，只是 Key 是 0 ~ 2^32 的整數（Array Index）

JS 沒有真正意義上的 Array，只有 interger indexed Object，這點相信對於 JS 有一定熟悉度的人，即使沒有看過標準，也對於這件事情有一定的了解

在 Python 因為是連續的記憶體，所以在進行 List loop 時，只是單純的尋找下一個記憶體位置，然後透過 pointer 取值。而在單就語言層面而言 JS 的 Array 反而更像 Python 裡面的 Dict，也就是 Key:value 的資料結構，只是 key 是大於 0 的整數而已。 

|| 這裡要有一個總結，總結說這個 ES 的設計本來就刻意為之，因為他不想對 JS 的語言曾承諾任何實作上的細節，也不想承諾效能上的模型

|| ECMAScript 的設計刻意避免定義「怎麼存」， 因為它根本不想承諾任何效能模型。

但看到這裡並不完整，前面也提過，JS 的開發上可以分成語言及宿主環境兩個層面，我們可以看看宿主環境，也就是常聽到 JS engine，像是 
- safari 的 JavaScript Core
- Firefox 的 SpiderMonkey
- Chromium 的 V8
- React Native 的 Hermes
- ...等等


而接下來，我們會拿 V8 為例子，探討這樣一個簡單的 Array Loop，背後是怎麼實作的。

## V8 引擎 - Element Kind

雖然前一個章節提到了 Console.log 這個 interface 完全是 host defined，並從規格上 簡單了理解了 JS 中語言層跟實作層的關係。但我們可以從 Object 的敘述中，了解的更加細節。

> The actual semantics of objects, in ECMAScript, are specified via algorithms called _internal methods_. Each object in an ECMAScript engine is associated with a set of internal methods that defines its runtime behaviour. These internal methods are not part of the ECMAScript language. They are defined by this specification purely for expository purposes. However, each object within an implementation of ECMAScript must behave as specified by the internal methods associated with it. The exact manner in which this is accomplished is determined by the implementation.
> 
> [ECMA-262, 16\<sup\>th\</sup\> edition, June 2025\<br\>ECMAScript® 2025 Language Specification](https://262.ecma-international.org/16.0/index.html#sec-object-internal-methods-and-internal-slots)

上面這段是對於 Object 中 Internal method 的敘述。簡單說，Internal method 是一套規格中定義好的內部方法，這些方法組成了我們平常使用 Object 的方式，像是從 object 中取屬性 / 新增屬性等等。 但這並不代表 engine 一定要實作這些 Internal method，而是比較偏向「心智模型」，只要表面上的使用符合 Internal method 的運作，完全不限制實做的方式，上面的敘述也有提到

> The exact manner in which this is accomplished is determined by the implementation.

這也是各家瀏覽器可以大顯身手的地方，我們就從 V8 引擎中 Object 的實作開始看起。

Object 很單純，只要是 string 當 key（其實還有 Symbol，還有如果用 number 當 key，會被直接轉成 string，另外，空字串也是允許的），value 可以塞任何的東西。

但實際的使用情境，並沒有那麼自由，舉我們一開始提到，需要遍歷一個 List 資料結構為例來說。從 JS 的角度來看，其實包含著兩種類型的 Object 應用情境

- 剛剛標準中提到的 Array 
- 而 Array element 的資料結構，雖然只是普通的 Object。但這個 Object 的結構是被高度共用的，所有的 array element 基本上都使用的相同資料結構。

剛剛提到了  Array indexed。在 V8 當中，儲存  Array indexed 屬性的位置，和其他屬性是不同的

 - Array indexed => 被稱為 element
 - 其他非 Array indexed -> 被稱為 props

Element 會依照不同的模式被進行儲存，而這樣的模式稱作 Element Kind，舉個下面幾個例子

```js
const a = [1, 2, 3];  // PACKED_SMI
const b = [1.1, 2.2];  // PACKED_DOUBLE
const c = [{id: 1}, {id: 2}];  // PACKED_ELEMENTS
```

例如這些 Array 內部的值都是高度一致的。V8 底層就可以使用類似  Python 連續記憶體的方式進行實作增加存取速度以及空間。但反過來，如果你的操作破壞了 element 的一致性，V8 就會對儲存模式進行「降級」，使用更寬容、減少優化的資料格式。例如：

```js
a.push(3.5)  // PACKED_SMI => PACKED_DOUBLE 
b.push({})  // PACKED_DOUBLE => PACKED_ELEMENTS
```

`a` 因為加入了 `3.5`，所以從 「連續的整數」（也就是 `PACKED_SMI`）降級成 「連續的浮點數」。而 `b` 也有一樣個概念，從「連續浮點數」降級成更綜合的「連續元素」。而除了 element 的類型以外，還有幾種不同的因素會導致不同的模式

```js
a[100] = 100  // PACKED_DOUBLE => HOLELY_DOUBLE
delete b[0] // PACKED_ELEMENTS => HOLELY_ELEMENT
```

```js
const d = [];
d[100_000] = 100000; // 可能是 DICTIONARY_ELEMENTS
```

上面的第一個範例打破了 Array 的連續性，讓其中有了空洞 (hole)。而第二個範例則是直接指定了特定的位置。這些因素都會讓 Element kind 改變，而在 Element kind 改變時，V8 可能就要轉換策略，例如轉換適合的資料結構，並重新複製記憶體中的值等。

綜觀前面的策略轉換，不同的 Element kind 之間其實形成了一個有層級的結構。每一種 Element kind 都代表著一個可容許的值行別以及儲存特性（例如是否連續、是否 holely、是否退化 Dictionary），一旦任何操作使其不相容，就會轉換到更為「寬容」的模式。


![](https://v8.dev/_img/elements-kinds/lattice.svg)


換句話說，Element kind 是依照一個**由嚴格到寬鬆、只會單向降級的結構**在運作。這樣的設計十分巧妙，讓動態，無型別的 JS，也可以在特定的條件下，享有近似靜態語言的速度。


|| 在這裡這部份可以提一個哲學。在靜態語言中 有所謂的 `int[]`，但 在動態語言中，Array 的內容是沒有型別的，在語言上的假設是：你可以在 Array 塞入任何東西。但這個假設是和語言的實際應用是有距離的。大部分的情境，你的 Array 還是有特定的模式。而 V8 觀察到的正式這一點，也是 element kind 的實作哲學。

|| 這裡再接順一點，從 Array 接到 Object 是一個好接的地方

但一開始有提到，這樣的模式只能用在 Array index 而已，也就是正整數作為 Objecy ㄕ的 Key，那其他的 Key 呢？

## V8 引擎 - Hidden Classes (Map)

幫上面這段的內容再做一個簡單的總結，可以更讓我們知道現在哪裡。前面有提到，Object 的 Key 可以是 String, Symbol，而其中 Array index key 指的是 String 中的正整數。而透過 Array index key 儲存的值，會依照不同的模式被儲存，這個模式稱為 Element Kind。到目前為止是這樣


|| 給個圖

|| named prop v.s. indexed prop

那其他的屬性呢？在這一段會介紹另一個儲存的模式：Maps (Hidden Classes)

Object 在 JS 的大部分使用情境下，是有所謂的「形狀」的。 舉一開始我們提到「訂單」的例子。雖然每一筆訂單的金額、項目、編號可能不一樣，但是每一筆訂單都有上述的資訊，而且資訊的資料內容是固定的：

- 項目：List (Array)
- 金額：Number
- 編號：String
- ...

從這個角度來看 Object 在這樣的情境，並不像傳統 Dict 那樣的資料結構來的雜亂無章，而這樣的統一性正是引擎可以優化的地方。V8 當然不會放過這點，在這部份，V8 的機制稱作 Map (Hidden Class)。

```js
function createOrder(id, price, items) {
    const order = {}
    
    order.id = id
    order.price = price
    order.items = items
}

const orders = data.map(createOrder)
```

延續上面訂單的例子，我們透過 createOrder 這個函式來建立訂單。在我們的想像中，Object 就像一個容器，裡面放滿了各式各樣的屬性，所以大概會是這個樣子：

![[Pasted image 20251226151209.png]]

我們要怎麼找到 Object 中的東西呢？這部份不是 ECMAScript 中有定義的，但在 Engine 的實作中，勢必得透過某種方式拿到記憶體的位置。我的腦中的想像可以再更清楚一點。

![[Pasted image 20251226151510.png]]

這樣的資料格式並沒有什麼特別的，基本上就是我們熟悉的 Hash map，我們先稱他為 HashMap-like Object。但如果熟悉 C 的同學，應該想到的可能是另一種資料結構：`Struct`。如果用 struct 的資料結構來表示，可能會像這個樣子，我們就先稱他為 Sturct-like Object

![[Pasted image 20251226162949.png]]

這兩個有什麼不同呢？如果單純只是看一個 Order，並沒有什麼顯著的差距，但是當我們有了 Orders，也就是多個類似的資料結構，才會體現。

![[Pasted image 20251226163858.png]]

在 HashMap like Object 的結構中，並沒有可以優畫的地方。每個記憶體位置都是獨一無二的。但反過來每個 Object 都有一樣的結構，這時候就能夠作一件我們很熟悉的事：抽象。

![[Pasted image 20251226164244.png]]

![[Pasted image 20251226164325.png]]

這時候，Struct-like Object 跟 HashMap-like Object 之間的差距就擴大了，如果數量更多，那儲存空間的差距會更顯著。事實上，這件事情在 C, Java 或其他靜態語言非常常見。下面是 C 的程式碼

```c
typedef struct { // 共用的結構
  int foo;
  int bar;
  int buz;
} Obj;

int main() {
  Obj* arr[3];                        
  for (int i = 0; i < 3; i++) {
    arr[i] = (Obj*)malloc(sizeof(Obj)); // 把 pointer 塞進 arr 裡面
    arr[i]->foo = 1;  // 指定 pointer 中對應屬性的值
    arr[i]->bar = 2;
    arr[i]->buz = 3;
  }

  int x = arr[1]->bar;  
  return 0;
}
```


可以看到上面的程式碼，透過一個 struct 來決定「形狀」，然後 array 內部其實只儲存分配到的記憶體位置，而不是直接儲存每一個屬性。這樣 struct like 的模式，更適合大量同樣的結構的 Object。但有一個問題點：JS 是動態語言，並不會先定義資料結構，那如何對結構進行重用呢？延伸上面的例子

```js
function createOrder(id, price, contactInfo) {
    const order = {}
    
    order.id = id
    order.price = price
    
    order.phoneNumber = contactInfo
}

const order1 = createOrder('1', 100, 'phone', '0987654321');
const order4 = createOrder('4', 400, 'phone', '0912345678');
```

如果把 property 新增的順序，整理成一個表的話，大概會像這樣。

|| 這裡需要再一張圖


這個順序正是 Hidden class 可以把動態語言的 Object，整合成類似靜態語言的 shape 的關鍵。當不同的 Object 透過同樣的順序新增屬性時，就是視為同樣的 Shape，並共用同樣 Hidden Class。透過這種模式，來節省記憶體，甚至可以加速值的存取[^1]。


|| 這裡再煽情，多一點 Hidden class 帶來的優化內容，例如 JIT, inline cache 等等的東西


但剛剛講到一個很重要的點是：「順序」。如果順序不對，即使內容一樣，也不會使用相同的 Hidden Class，就如同下面的程式碼：

```js
function createOrder(id, price, contactInfo) {
    const order = {}
    
    order.id = id
    order.price = price
    order.phoneNumber = contactInfo
}

function createIsomericOrder() {
    const order = {}
    
    order.id = id
    order.phoneNumber = contactInfo
    order.price = price
}

const order1 = createOrder('1', 100, 'phone', '0987654321');
const order4 = createOrder('4', 400, 'phone', '0912345678');
```

雖然 order 的內容是一樣的，但順序不同會導致無法使用共用 Hidden Class 的優化

|| 這裡不講 Branching 了，叫他們自己去看文章拉，關我屌是


## JS runtime 的設計哲學

設計一個面向瀏覽器，並使用 JS 作為語言的 runtime 有許多挑戰。

- 有些頁面可能開了 1 秒就馬上被關掉，但另一些網頁你可能會逛上好幾個小時，兩邊的執行效率都必須要兼顧。
- [^4]JS 是動態型別，沒有 compile time 來做到程式碼上的優化
- 難以確定用戶的使用裝置：可能是電腦、也可能是手機，效能上有很大的差異
- 很難確定網頁的複雜度，個人部落格並不複雜，但許多 Web app 卻並不比 Desktop App 簡單。

這讓 V8 在設計時，就採用了和其他 runtime 很不同的哲學：

> We optimize for the common case, and deoptimize when we’re wrong.

前面介紹了兩種 V8 引擎的優化方式都是這個哲學的產物：Element Kind 跟 Hidden Class，但不只這樣：

- JIT：一些常用的分支會預先編譯成 bytecode 來執行，加快速度
- inline code：把常用的小 function 直接展開，減少呼叫 function 的查找跟 stack context 建立
- On-Stack Replacement[^2]：大量 loop 的執行區塊會轉換成優化過的 bytecode 加快速度
- Builtins fast paths：常用的方法 + 類型的組合（例如 Array.map / sort / filter 等），會有特定的內部方法加快速度，不符合才退階成原始的實作。
- 等等...

不論是從執行期的觀察執行模式，抑或是 JS 語言層面在使用上的習慣。概念上，都是針對這些被大量使用的「模式」進行執行上的優化。反之，如果出現了與當前使用模式不符的狀況，則進行「降級」。

這樣的概念有一點類似 CPU 優化的 Speculative Execution，同樣都假設了未來的程式碼的執行模式。但 CPU 在猜測錯誤會捨棄計算結果，而 V8 引擎則是回到未優化的執行模型，並重新累積統計上的可信度。這也是 V8 常常會被詬病「慢熱」[^5]的原因，在這樣的哲學下，有進行優化 / 未進行的程式碼執行上差異極大。雖然這樣的模式在 V8 的使用情境下上非常適合，但並不是每個 JS 的 runtime 都採用一樣的哲學。

這裡舉另一個與 V8 幾乎是光譜兩端的例子： Hermes。Hermes 是專用於 React Native 的 JS Engine，而 React Native 則是使用 JS 來撰寫 Native App 的框架。Mobile 環境有一些和瀏覽器很不同的地方：

- App 常常被背景 kill，需要重啟
- App 不會有動態載入的可能
- App 的 runtime 已經是預先 build 過的，而不是直譯式
- Mobile 的記憶體比 Desktop 小很多
- life cycle 比 Browser 明確很多，尤其是不會有一個 App 在兩個地方一起執行的狀況
- 幾乎不用處理「向後相容」的問題，而且生態相對封閉
- 裝置型態相較於 Browser 較有限

也因此，如果我們要打造一個專門為 Mobile App 的 JS engine 的話，可能會想到這些特性：

- 冷啟動要快
- 記憶體用量要小
- 但不需要支援過舊或過於自由的語法，像是 `eval` 這種屎坑[^6]
- 可以嚴格限制開發者使用的語法範圍，而不需要支援整個語言功能
- 在執行上高度可預測

有了上面的幾個特性， Hermes 能夠採用完全另一種策略：把原本執行 JS 中的分析語法、轉換成 bytecode 的兩個階段，先透過 compile 的方式，直接轉換成 bytecode 並給 App 執行。這樣不只加快了執行的速度，也能夠讓佔用的容量更小。另外，相較於 V8 的 JIT，Hermes 在記憶體控制上相對來說更加可控、一致，雖然效率上不一定優於暖機後的 V8，但這樣的策略更加適合 Mobile 的使用情境。

## 怎麼在 「JS」 優化

前面提到 V8 的 JIT (Just in Time)，還是 Hermes 的 AOT (Ahead of Time) 的 engine，但實際上 JS 還有很多的 runtime，每個 runtime 都有自己的一套「哲學」。還記得我們這邊文章一開始在提什麼嗎？

一開始，我們從 JS 程式碼的「優化」開始提起，與 JS 多年的競爭對手 Python 作個比較。接著，稍微看了一下 ECMAScript 的標準，開始思考 JS 的「程式碼」其實是什麼，又不是什麼？最後，我們潛到了最底層，開始了解 JS runtime engine 實際上是如何「執行」這些程式碼的。

到了這裡，我們可以好像回答一開始我們的問題了：

> 你的優化在 JS 裡面真的有用嗎？

這樣看來，在程式碼中少幾次 loop，少建立幾個變數，或者是改用 for loop, while 等一些「以為有用的優化」，並不一定有你我想像的有用。如果我們真的在乎程式碼的執行速度，從剛才的了解，似乎要了解引擎背後的優化模式，多使用符合引擎優化方式的寫法。

事實真的是這樣嗎？

在第一篇提到，JS 語言與「執行環境上」是「分離」的，也就是語言並沒有特定被執行的情境，可以被使用在任何的地方。把這篇文章讀到這邊的你，或許聞到了另一個類似的味道是：JS 語言與執行模型也是「分離」的。換句話說，使用 JS 這個語言，想要做到完全控制實際的執行方式是不現實的。

|| 上面這段好像不太好

但回到原本的效能問題，使用 JS 卻在乎效能並不是錯誤，也不代表 JS 無法寫出大規模的應用程式[^8]。問題在於，你應該控制的是哪一個層級。

JS 是抽象程度很高的語言，換句話說當你選擇了 JS 這語言去開發應用（當然，如果你是 browser side 其實別無選擇），相當於你選擇更快的開發速度，更低的系統整合成本，更成熟的工具鍊，反過來，你也捨棄了更細緻的執行控制，並把他交給 runtime。從這個觀點來看，如果你想要增加效能，不應該去作 micro-opt，更應該從這些角度出發：

1. 你的資料流、模組邊界、狀態之間的設計合理嗎？
2. 你有在合適的抽象層級上做事情嗎，例如是不是使用了 app logic 處理 framework 上的問題？
3. 你的 Library 離你的使用情境多近？會不會選了一個很複雜的 framework 卻沒有用到全部的功能？或者是在強烈需要效能、客製化的地方選擇了過於包裝的工具？

當然， JS 絕對不是萬靈丹。當你這些東西都做到了，然後發現 bottleneck 還是在應用層，而不是 Database, IO 等。那你的情境也不再適合使用 JS 了，你需要更細粒度的控制，可能是

- 更精細的資料儲存結構
- 更大量、密集的運算
- 更穩定的延遲控制
- 更底層的硬體 / OS 控制

這些東西都不是 JS 可以做到，甚至不是任何一個高階抽象語言適合的領域。更合適的作法可能是將這些部分移到低階抽象語言，而使用高階抽象語言進行整合。

## JS 的千變萬化

身為吃 JS 飯的工程師，雖然有點不太客觀。但能夠把一個動態型別、並且不需要事前編譯的語言做到這樣的執行效率，可以說是工程奇蹟了。但這個奇蹟並非來的理所當然。從一開始被創造，然後跟著瀏覽器發展，又外溢到其他領域。 JS 創造了與眾不同的語言文化：一個野生

文化固然混亂，但又有跡可循。







|| 這裡的結尾不太好
|| 這裡的結尾應該要有承先啟後的感覺，
|| 前面已經有個總結感了


|| 再一次拉回，為什麼 JS 可以作這麼多的優化？正式因為他在語言層的薄弱跟自由，所以引擎層才能夠，也需要作這麼多的優化。

已經不只是這樣了，不只是因為語言曾。而是從一開始的文化，使用情境。

JS 的 reference 並不是像 C, Java 確定的記憶體位置，所以可以交由引擎自由的搬動，正式因為這樣，V8 才有辦法做到在底層，自由的使用不同的資料結構來作優化，但是在語言層，不管今天是使用 Array，都像 JS 的標準中所描述的，使用同樣 Object 這個語言層的介面


## Bonus：千變萬化的「代價」

實作上的自由讓 JS 可以適應更多不同的情境，在效能上也更有優化的潛力，但並不是所有的資料結構都適合這樣的自由。對於一些資料，或許可以只透過抽象過的數據結構像是物件，陣列來進行操作。但某些資料使用更加低階的方式會更方便，最明顯的例子就是二進制的資料。

二進制資料聽起來很陌生，但其實離你我都很接近，例如

- 音樂、圖片、影片
- 非文字的檔案
- 加密 / 壓縮 / hash

在這些情境，JS 中常見的 Array, Object 等資料結構，並不適合用來表示

來表示，通常使用 Array 或者是 String 來作替代，但空間效率低下，操作起來又不直覺。

為了解決這個問題，JS 在 ES6 就推出了 TypedArray，用來直接操作這接二進制資料。

這也打開了 JS 在更多情境中使用的可能性，例如 GPU 運算、Server side 的。

- GPU 運算 （3D 渲染, 物理模擬等）
- 更多元的 Protocol（WebSocket, Protobuf, 一些 IOT 等）

> TypedArray 的存在，某種程度上承認了一件事：傳統 JS 的抽象，並不完全適合所有資料。








[^1]: V8 會作 inline cache

[^2]: [Fetching Title#a802](https://wingolog.org/archives/2011/06/20/on-stack-replacement-in-v8)

[^3]: 測試框架提到 JS engine c會被常用的 code 作優化  [GitHub - evanwashere/mitata: benchmark tooling that loves you ❤️](https://github.com/evanwashere/mitata?tab=readme-ov-file#loop-invariant-code-motion-optimization)
    

[^4]: 不是這樣的，這段馬上會被打臉 

[^5]: 所以 JS 的測試框架許多都有預熱的功能，來避免這種優化模式帶來的差距

[^6]: 你可能沒想過 eval 這個語法多無所不在，可以看看這篇論文 [ecoop11.pdf](https://janvitek.org/pubs/ecoop11.pdf?utm_source=chatgpt.com)

[^7]: 來自蛋堡的「來硬的」

[^8]: 可以看看 blueSky，大部分的 BlueSky 都是使用 JS (TypeScript) 寫的，只有需要高速效能才使用 Go
