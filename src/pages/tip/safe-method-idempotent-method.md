---
title: '[極短篇] HTTP 的 Safe method 還有 Idempotent method'
pubDate: 2020-06-06T00:00:00.000Z
tags:
  - HTTP
layout: /src/layouts/Post.astro

---
HTTP method 有很多種，method 有所謂的語意。白話來說，就是這個 method 有它本來被定義的時候應該要做的事情。

符合語意是很重要的一件事情，Browser 等的開發上，會依照 spec 去實施，而，而像是 RESTful 的 API 風格也是以 HTTP method 本身的語意為基礎去延伸的。但語意歸語意，開發歸開發，實際開發上還是會出現像是拿 `GET` 來刪除東西像是：`post/delete?id=1` 這種東西（上古時期比較有可能會看到）。

回到原本話題，HTTP method 在定義的時候就有提到哪些是 Safe method 或者是 Idempotent method。這些是什麼？

![可以看到 Safe 還有 Indempotent](https://static.coderbridge.com/img/Lauviah0622/1f6fdbc361fd4d8fb37d8060d157d081.png)

## Safe Methods

Safe Methods 的[定義](https://www.rfc-editor.org/rfc/rfc7231.html#section-4.2.1)是：
> RFC 7231 4.2.1 Safe Methods
> Request methods are considered "safe" if their defined semantics are
   essentially read-only. i.e., the client does not request, and does
   not expect, any state change on the origin server as a result of
   applying a safe method to a target resource. 
   
很難看懂，我也覺得，[MDN](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP)上面的好懂多了

> An HTTP method is safe if it doesn't alter the state of the server. In other words, a method is safe if it leads to a read-only operation

簡單的說，Safe method 不應該造成 server 上任何的關於用戶的資料變動。也就是你不應該用 Safe method 去改你 server 上的資料。而這也代表著 Safe method 只提供讀取資料或讀取狀態行為（不改資料，換句話說就是只能讀取）。但這只限於和用戶有關的資料，如果是作 log 或者是紀錄有幾次是沒問題的，因為不影響到使用者。

當然可能看過像是 `http://blog.com/post/delete?id=1` 利用 `GET` 的 reqeust 來刪除文章，你要這樣做也可以。但是  Safe method 因為特性的關係，browser 在設計上會有對應的行為，像是 cache （因為只讀取，所以 cache 起來也沒關係）。

除此之外因為不改 server 上的資料，表示說要怎麼 request 都可以。所以瀏覽器也會做 pre-fetch，還有爬蟲也主要使用 safe method 來抓資料。如果你使用上面的方法就有可能因為被 cache 住了，request 也不會真正被發出去而刪除不到資料。

總而言之，在設計 API 時 Safe method（對，就是說你 GET，出鏡率最高的 GET）。不要拿來修改用戶的資料，很可能會出現問題。

## Idempotent Methods
那另外一個名詞 Idempotent Methods 是什麼？

看完 Safe Methods 後應該大概懂說這些標準的意義在哪裡。也就是：請你不要這麼做，但你真的這樣做我也不能怎麼辦（畢竟 server 是你寫的），不過在遇到 browser 上的一些機制可能會出問題。

同樣的 Idempotent Methods 也是：[定義](https://www.rfc-editor.org/rfc/rfc7231.html#section-4.2.1) 是這樣寫的  
> A request method is considered "idempotent" if the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request.  Of the request methods defined by this specification, PUT, DELETE, and safe request methods are idempotent.

[MDN 白話版](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)（其實 RFC 這段相對寫得白話我覺得 XD）
> An HTTP method is idempotent if an identical request can be made once or several times in a row with the same effect while leaving the server in the same state

Idempotent method 是指說不管 Request 幾次，結果都一樣。從這個定義來看，`DELETE`, `PUT` 還有 Safe methods 都是 Idempotent method。

通常 `DELETE` 會帶上 id，所以刪除 1 次和刪除 100 次是一樣的，server 那邊找不到 id 操作就會被忽略。而 `PUT` 也一樣，`PUT` 代表替代的 http 操作，你發了 1 次 request 已經取代了內容後，那即使再發 100 次也只是替代一樣的內容。

但是 `PATCH` 則不一定了， `PATCH` 在語意上代表著修改資料，換句話說可能這樣：
```
PATCH http://blog.com/post?id=1

body
{
    title: 'new title'
}
```
request 代表著只更新 title, 這樣的 request 符合語意也 Idempotent。發了 100 次和 1 次標題都是同樣的 `new title`。但有另外一種可能
```
PATCH http:shop.com/item/add?id=1

body
{
    number: 10
}
```
requst 代表的是增加 10 個 item 的數量。這種情況下也符合語意（修改資料），但就不符合 Idempotent 了，100 次會新增 1000 個。那 POST 就不用提，一次和 100 次肯定是不一樣的。

雖然 Safe method, Idemptent method 好像冷知識的感覺，但也是了解 HTTP method 算重要的一環，了解後寫出來的 API 比較不會遇到被瀏覽器擋掉的奇怪 Bug。

Big Guy Is John，感謝大家的收看。

參考資料：
- [HTTP 協議的Idempotent Methods](https://matthung0807.blogspot.com/2019/02/http-idempotent-methods.html ) 寫的很好廢話不多
- [MDN Safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP)
- [MDN Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)
- [RFC](https://www.rfc-editor.org/rfc/rfc7231.html#section-4.2.1)


