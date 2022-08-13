---
title: 為什麼要用 IIFE
pubDate: 2020-08-25T00:00:00.000Z
tags:
  - javascript
layout: /src/layouts/Post.astro

---
### 防止污染全局變數
因為 var 是 依照 function 來區分 scope(function scope) 的，所以以前都會用 IIFE 來避免汙染。但現在的 const 還有 let 都是 block scop。所以如果怕污染可以直接用大括號包起來就可以。

```js
{
    const a = "123";
    let b = "456"
}
```

但是，但是，就是有個但是！如果不支援 ES6 呢？所以還是用 IIFE 吧。

    
### 防止內部變數被存取
這個自己還沒有用到過。可以看下面這個 case。

```js
const uniqueId = (function() {
  let count = 0;
  return function() {
    ++count;
    return `id_${count}`;
  };
})();

console.log(uniqueId()); // "id_1"
console.log(uniqueId()); // "id_2"
console.log(uniqueId()); // "id_3"
```

可以發現說，除了直接讀取 uniqueID 之外，沒有辦法存取到裡面的 count 的值。這樣就完全保證了裡面的東西不會被用到。這樣可以保證內部變數的隱私性。

JS 有一種 design pattern -  [revealing module pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript) 很依賴這樣的模式

```js
const counter = (function() {
  let counterValue = 0;

  return {
    increment() {
      ++counterValue;
    },

    get value() {
      return counterValue;
    }
  };
})();

counter.increment();
console.log(counter.value); // 1

counter.increment();
counter.increment();
console.log(counter.value); // 3
```

你只有使用 counter.increment() 才能夠操作 `counter.value`，而這樣的模式可以保護內部的參數。
    
### 幫 Library 新增別名。

如果你用了兩個名子一樣的 library，就可以把整個 library 的東西包起來作為一個變數。

```js
window.$ = function somethingElse() {
  // ...
};

(function($) {
  // ...
})(jQuery);
```

可以像這樣都包起來 然後指定給一個 variable。這種方式稱作 alias variable 給 library 一個別稱，讓同樣名子的 library 不會互相汙染，也更方便使用。

### 在不同的環境存取 global object：

```js
(function(global) {
// ...
})(this);
```

如果有跨環境執行（例如一段程式碼在 browser 和 node.js 都需要執行）的狀況時，在這種情形 global object 的名稱不一樣，browser 是 window, node 是 global，那麼就可以用這種方式來統一存取 global object。

### 優化程式碼的名稱

如果在你的 code 裡面用到很多很多全局變數的話，那你的 code 裡面會充滿著 window 或者是 global。 這時候你就可以用像剛剛 alias variable 的方式。
```js
(function(w, d, u) {
  // ...
})(window, document);
```

這樣就可以讓 uglyfyjs 等等的 JS minifier 來縮減變數名稱。

而且這樣做還有另外一個優點，因為局部變數比全局變數處理的時間還要快。所以如果用到很多的全局變數可以這樣處理。

>Local variables are faster to resolve than the global variables, but this is on a huge scale and you’ll never notice the speed increase - but also worth considering if we’re referencing our globals a lot!
>
>https://ultimatecourses.com/blog/what-function-window-document-undefined-iife-really-means
    
### 防止 undefined 的值被改變

undefined 是一個 global variable，未設定的時候值是 undefined 。但 undefined 不是保留字，在沒有 strict mode 的情況下可以被 assign。所以下面的情形方式可以避免 undefined 變成奇怪的東西。
```js
undefined = true;
(function (window, document, undefined) {
  // undefined is a local undefined variable
})(window, document);
```


### 參考資料
- http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html

- https://ultimatecourses.com/blog/what-function-window-document-undefined-iife-really-means

- https://mariusschulz.com/blog/use-cases-for-javascripts-iifes

- https://mariusschulz.com/blog/disassembling-javascripts-iife-syntax