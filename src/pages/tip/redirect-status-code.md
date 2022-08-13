---
title: '[極短篇] 關於重新導向的 status code'
pubDate: 2021-07-15T00:00:00.000Z
tags:
  - HTTP
layout: /src/layouts/Post.astro

---
想想下面這個情境。

假設你原本的網站叫做 old.com
後來你換了一個域名，叫做 new.com

再轉換初期你一定是要兩個都保持，不然原本都用 A.com 連線的小朋友們不知道你連到 B.com，他們就不知你的網站到哪裡去了。就像你的店名原本叫台南牛肉麵，突然你想要愛逮丸一點，叫做台灣牛肉麵，但其他人只知道台南牛肉麵，一直問台南牛肉麵在哪裡，殊不知你已經改名子了（好啦，如果問人一定還是知道台灣牛肉麵就是以前的台南牛肉麵）。

所以在換域名初期你會兩個域名都先保留，等大家都記住 new.com 的時候在把 old.com 關掉。
但是大家都還是用 old.com 連怎麼辦？我們會把 IP 掛到 new.com，然後 old.com 用 redirect 的方式導到 new.com。

那我們要怎麼 Redirect？我們可以透過下面幾種方式

- response header 的 location
- HTML 的 meta 元素 HTML 重新導向機制
- JS 的 `window.location = URL`。

後面兩個可能比較不熟悉，這裡不詳細講這個東西，可以看這邊 [設定重新導向的其他方法](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Redirections#%E8%AE%BE%E5%AE%9A%E9%87%8D%E5%AE%9A%E5%90%91%E6%98%A0%E5%B0%84%E7%9A%84%E5%85%B6%E4%BB%96%E6%96%B9%E6%B3%95)


平常我們輸入 domain name 之後的流程是這樣的：

```
1. client: old.com => DNS server
2. DNS server: IP => client
3. client: IP => server 
4. server: response => client
```

當我們拿到 IP 之後，為了減少之後重新向 DNS server request，所以瀏覽器有 cache 會記錄 域名 還有 IP的對，減少向 DNS request 的次數。那如果平常重新導向，會是這樣的流程

```
1. client: old.com => DNS server
2. DNS server: IP => client
3. client: IP => server 
4. server: response(根據 domain name) redirect to new.com => client
5. cient : new.com => DNS server
6. DNS server: IP => client
7. client: IP => server
```
在第四個步驟 `server: response(根據 domain name)` 有個很重要的點，就是 Status code 這會影響到瀏覽器重新導向的方式，簡單來說重導向需要考慮的點有幾個。

### 永久還是臨時
這個東西的影響層面跟瀏覽器還有搜尋引擎有關係。

剛剛有提到說瀏覽器會用 cache 紀錄域名還有 IP，如果是永久導向，那麼瀏覽器就會修改紀錄，例如像剛剛的流程，假如我們是永久導向。
```
1. 使用者輸入 old.com
2. 瀏覽器翻了 cache 發現這樣一筆紀錄 old.com: 3.444.555.666 了，指向到 3.444.555.666，直接向 3.444.555.666 發送 request。
3. reponse 顯示：永久 redirect to new.com 
4. new.com 發現 cache 裡面沒有，所以向 DNS 找找，於是找到 3.444.555.666
5. 瀏覽器發現說這個網頁已經永久導向了，所以修改剛剛的紀錄變成 old.com: new.com, new.com: 3.444.555.666。
```

所以之後如果我們要搜尋 new.com 就不會再找 DNS了，而且輸入 old.com 也不會再重新發 request 到 old.com，因為已經紀錄說 old.com 已經導向到 new.com

如果是臨時導向呢？就不會有改紀錄這個動作，還是會重複原本的步驟。

要注意的是，並不一定 new.com 跟 old.com 都在同一個 server 上，也有可能在不同 server，像是短網址的服務，或者是你整個部落格也跟著搬 server 換 IP 也有可能。

而決定永久還是臨時的就是靠 status code

- 永久： 301, 308
- 臨時： 302, 303, 307
- 其他：
  - 304 會被導到舊網頁
  - 300 用戶可以自己選

### 重導向之後的 request method 還有 body
還有一個問題是，如果發出的 request 不是 get 呢？例如說：你是發送表單，用的是 POST method，而且夾帶著 form data，結果 request 之後 method 變成 get，那就完全送不出資料了。

所以另外一個考量點就是，redirect 之後的 request method 還有 body。
有幾種選項

- GET 不變、其他 method 可能會變成 GET： 303
- method 跟 body 都不會變：307, 308

為什麼沒有 301 跟 302 ？因為當初規範沒有講清楚這個東西，所以一個規範各表，變成有些有些有改、有些沒改。上面的 303, 307, 308 就是為了統一所以提出的新規範。

參考自：

- [HTTP 中的 301、302、303、307、308 响应状态码](https://zhuanlan.zhihu.com/p/60669395)
- [搞懂 http 3xx 重新導向狀態碼](https://medium.com/@dubiety/%E6%90%9E%E6%87%82-http-3xx-%E9%87%8D%E6%96%B0%E5%B0%8E%E5%90%91%E7%8B%80%E6%85%8B%E7%A2%BC-f1a288c1cd20)
- 使用情境可以看[這邊](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Redirections#%E6%B0%B8%E4%B9%85%E9%87%8D%E5%AE%9A%E5%90%91)

