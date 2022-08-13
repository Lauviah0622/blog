---
title: Inside look at modern web browser
pubDate: 2020-09-27T00:00:00.000Z
tags:
  - browser
layout: /src/layouts/Post.astro

---
大概看完了[這個](https://developers.google.com/web/updates/2018/09/inside-browser-part1)系列，想寫一下筆記，現在這個程度看這個文章資訊量還對我來說還是蠻驚人的，雖然 Huli 會說當作科普來看就好，但還是做個筆記吧 XD。不然自己一定會忘記的。

先概覽一下四個章節分別在講什麼：

Part1 會講解說 CPU/GPU 各自的功用，還有講解 Process / Thread 之間的差異，而講解這些是為了理解說 chrome multi Process 的設計以及各個 Process 的分工。

Part2 跟 Part3 會講到我覺得比較重要的部分。Part2 是從輸入瀏覽器到拿到 response 渲染前（這個階段稱作 navigation），Part3 則是從渲染。

Part4 主要是提到說事件的觸發跟處理，瀏覽器怎麼樣對事件做優化，還有一些在事件上我們可以做的優化部分。

大概是這樣，了解一下大概的架構，可能會比較好理解自己在哪裡還有在講什麼，比較有安全感，人總是會對未知感到恐懼。

## Part1 底層處理以及瀏覽器架構


### CPU/GPU, Process/Thread

CPU 跟 GPU，常玩電腦組裝的應該蠻了解的。

- CPU 可以處理任何計算，但是單次處理量較少
- GPU 只能處理特定簡單的運算，但是處理量很大

在網路上有看到有趣的比喻：

> GPU是一群小学生，扎堆算加减法；CPU是一个老教授，能解微积分。CPU的核比GPU复杂得多呢。

這裡要理解的是 CPU 跟 GPU 各有所長，而瀏覽器也會利用他們不同的特性來做不同的運算。接下來我們要理解 Process （程序） 跟 Thread （執行緒）的差異。

Process 裡面會有很多 Thread。OS 會分配資源給 Process，而 Process 裡面的 thread 可以共享這些資源以及共享彼此間的資訊，但 Process 間的資訊交換就必須透過 IPC (Inter Process Communication)

上面這些都是關於電腦運作比較底層的基本知識，也必須要先知到這些才有辦法了解 chrome 瀏覽器的運行架構。

### Chrome 的運行架構

chrome 採 multi Process 架構。一個瀏覽器會有很多不同的任務，像是網路連線、UI、儲存還有每個 site 畫面的 render 等等的。而 Chrome 將這些不同的任務交給不同 Process 處理。這樣做的優點是當一個 Process 出問題時，直接關掉那個 Process 就可以，不會影響到其他 Process，舉例來說，Chrome 本身一個網頁的 render 就會作為一個 process，假設其中一個分頁當機了，就算關掉也不會造成影響。

另一個好處是安全性，Process 間沒辦法輕易地共享資料，將分頁獨立出來可以防止讀取到其他分頁的資料。而這也是 chrome 本身使用 site Isolation 的原因，render Process 是以 site 也就是網頁為單位，如果頁面裡面有 iframe，那iframe 也會獨立成另一個 Process ，這樣可以防止 iframe 的 site 存取到頁面的資料。

採 Multi Process 的缺點也是顯而易見，就是耗費資源（也是全世界都在詬病的點），尤其是 renderer Process，每一個 Process 都需要一具 V8 engine 才有辦法運行（不是汽車的 V8）。當硬體資源有限的時候，chrome 會把同一個 來源但不同分頁的 site 放進同一個 Process，用來兼顧安全性以及資源。

除此之外，chrome 也可以透過將 Process Servicification（服務化），可以讓 Process 變成 thread 再組合成一個 process 來節省資源。

## Part2 Navigation

先講講說大家對於瀏覽器平常的認識。把網址輸入 address bar，像是 `www.google.com`，然後瀏覽器 tab 上面的 icon 會先轉轉轉，然後跳出頁面之後，就轉好了。

上面是一般人的理解，身為前端工程師一定要知道的多一點。

我們知道說當我們輸入 `www.google.com` 之後會先送到 DNS server 拿 IP，然後我們再用 IP 連到 server，並且送出 request。等我們收到 server 的 response 之後，瀏覽器會把我們收到的 response（先假設是 html） 解析成我們看到的網頁。

不過還有一點是，現在 address bar 也可以當作 search bar，當你直接打 `google` ，就會跑出 `google` 的 google 搜尋結果，不過道理跟上面一樣，只是瀏覽器會幫你連到 google 的搜尋結果而已。

現在可以了解更底層的東西，就是瀏覽器幫我們做了什麼，然後是瀏覽器的哪個部分去處理的，然後是這些部分是怎麼樣交換訊息。

我們可以先把 Navigation 這個階段大概切成幾個步驟，但是這幾個步驟不一定是先後關係，有些可能是平行的。

- 處理 adress bar 的 Input
- 檢查 Input 有沒有對應的 cache 或者是 service worker
- 送出 request
- 初始化 renderer Process
- 確定 type 並檢查 Body

### 判斷 Input

一樣的開始：輸入網址列。網址列本身是由 Browser Process 裡面的 UI thread 所處理的。Browser Process 處理網頁畫面（渲染）以外的所有東西，像是前面講到的瀏覽器 UI、儲存、網路等等...

UI thread 會讀取你的 input，然後看你輸入的是不是 url，然後開始轉圈圈，接著他會初始化一個 network call，選擇適合的 protocal，接著就把資料丟到 network thread 去處理（這裡詳細的分工可能還是要看一下 docs 或者是 source code）。

### 決定 body 的處理方式

server 端的事情不講了，當我們收到 reaponse 之後，有一個東西會決定 response body 要清蒸還是要紅燒，那就是 content-type。瀏覽器會根據 response header 裡面的 content-type 還有 body 的內容（因為 content-type 可能會不見或者是出問題，還是要自己判斷 body 比較準
）來[判斷](https://source.chromium.org/chromium/chromium/src/+/master:net/base/mime_sniffer.cc;l=131)說要怎麼處理，像是圖片的就會跑出圖片、檔案就會進行下載，不同的格式會有不同的處理方式。chromium 相較於各~~小~~大瀏覽器比較晚出現，因此這方面也參考了前人的做法，但最後只有 html 的內容才會被進行 render。

### 安全檢查

值得注意的部分，在這個階段也會檢查 body 有沒有連到怪怪的檔案或者是連到惡意的連結（應該是會有一個 black-list），並且會執行 [CORB](https://www.chromium.org/Home/chromium-security/corb-for-developers)（目前看下來這個功能是擋掉一些可疑的 request 方式跟 content-type 還有 body 格式的組合），在想這個部分做的可能不只這些，像是 CORS 的檢查可能也是這部分處理的，真的沒問題才放 response 通過。

通過之後，network thread 通知 UI thread，而 UI thread 會開啟一個 renderer process，這裡有一種 UI thread 像是主控的感覺？不過我不清楚說是不是在架構設計裡就應該要以 UI 作為整個程式的主控，對 design pattern 還不熟。這裡有一個可以優化的點，Renderer Process 可以在 request 被送出去的時候就同步初始化，先處理一些不需要 response 的部分，等 response 到了之後就可以直接處理 Response。

當 renderer Process 跟 Response 都 OK 之後就可以 GOGO 了，但是要要記得資料還在 Browser Process 裡面阿，所以要透過我們一開始有提到的 IPC 去傳遞資料給 renderer Process，然後就開始解析囉。

### 其他 Browser Process 會處理的東西

這裡還有幾個小細節：想一想自己的經驗，假設說網頁跑不出來一直轉，有時候我們會按上一頁返回到上一個頁面。所以我們就可以確定說，歷史紀錄是在 network 拿到 response 之前就確定好的，雖然文章沒有提到，但是我在猜說應該是在初始化 renderer Process 的時候就會處理好歷史紀錄的東西。

還有當網頁載入完的時候，renderer Process 也會通知 Browser Process，要把網頁的 favicon 顯示出來。

最後我們不要忘記當我們關閉分頁（site）的時候，Browser 會把我們的網頁放進歷史紀錄裡面做 cache，下次在拜訪這個網頁就可以直接跳出來。

`beforeunload` 這個事件會在從一個網址導向另一個網址時被觸發，文章裏面有提到，但是覺得沒有很困難，感覺像是小補充而已。

### Service worker

每次在 Navigation 的時候都會檢查 url 有沒有對應的 Service worker（後面簡稱 SW，讓網頁可以在被關閉的時候也能夠執行程序的東西，推薦[這篇](https://medium.com/@kosamari/service-worker-what-are-you-ca0f8df92b65)），有的話就會先執行 SW，因為可能 SW 裡面就有 cache 可以用了，沒有才進行 request。

但如果 SW 早就決定說不要了怎麼辦，這樣不就會慢了一點嗎？尤其是 SW 又很複雜的時候，所以 FB 就不爽了，直接跟 chrome 說你想個辦法讓 SW 不會影響到 request 送出的速度（超兇的），就這樣有了 [Navigation Preload](https://developers.google.com/web/updates/2017/02/navigation-preload) 這個東西，人還是要有靠山說話才能夠大聲啊。

## Part3 Render Pipeline

這部分覺得蠻複雜的。但我覺得會是這幾個 Part 裡面最重要的部分，這會大大關係到網頁的效能，你的網頁跑起來卡卡的會跟這部分有很大的關係。

Render 的中文又叫渲染，自己覺得這個翻譯蠻彆扭的，這個部分會將程式碼（就是 html, css, js）轉化成人類看得懂的文字還有畫面，這個部分分幾個階段，跟上一個 Part 不一樣，有**嚴格的前後關係**，這個步驟會稱作 Render Pipeline。

1. Parsing
1. Sytle Compute
1. Layout
1. Paint
1. Composite

首先是 Parsing 解析。這裡的大方向是把 html 的內容解析成 DOM tree，瀏覽器的入口點都是 html 檔案，而瀏覽器會將 html 轉化成瀏覽器還有我們可以操作的形式，那就是 DOM（document object model）。

tag 有很多種，但是有幾種會影響到我們的 DOM tree，分別是 `<script>` 還有 `<link>` 跟 `<img>` （可能還有其他的）。這些東西會加載其他資源。加載資源要時間的！遇到這種要 request 的東西有個概念：提早做，放旁邊，好了在叫你。在 Navigation 中也是初始化 renderer Process 跟 Request 並行。所以 preload scanner 會先看看有沒有這些 tag，有的話就先交給 browser process （裡面的 network thread）去加載。

除此之外，`<script>` 還可能會執行 JS。JS 有可能會改變先前的 DOM tree，所以這裡會先處理 JS 裡面的內容。

這個部分會影響整個網頁的加載速度很大，若 JS 裡面並沒有會影響 DOM 的內容，可以使用 `async` 跟 `defer` 來優化。加載資源也可以透過 [preload](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Preloading_content) 的 tag 屬性來指定什麼資源要先行加載。


接下來是 style compute，可以先想一下說 CSS 到底是什麼？ CSS 是一堆規則，他指定了 

1. 套用的範圍 
2. 套用的樣式

但是 CSS 沒有指定每個 element 要什麼樣式。

這是視覺化的第一個步驟，計算每個 element 身上要套哪些 CSS（可以從 devtoole 的 compute 看到，有時後會比看 CSS 好用很多）。這部分還會把瀏覽器預設的 CSS 也加上去。

從這一個步驟開始就是瀏覽器渲染引擎的工作了，想了解更多可以看看[小弟之前的文章](https://lauviah.coderbridge.io/2020/09/26/1-%E5%80%8B-div-%E5%92%8C-4-%E8%A1%8C-css-%E5%B0%B1%E8%83%BD%E6%9B%B4%E4%BA%86%E8%A7%A3%E7%80%8F%E8%A6%BD%E5%99%A8%E6%B8%B2%E6%9F%93%E5%BC%95%E6%93%8E/)有提到。

第二個步驟是 Layout，我會覺得這個步驟很像畫草稿，把所有的元素定位，不需要定位的去掉，額外要定位的東西加進來，而這個部分的結果叫做 Layout tree。

什麼是不需要的跟另外要定位的？

像是 `display: none` 就完全不會在畫面上出現，所以會在這部份去掉，只會留在 DOM 裡面，而偽元素就是 html 上面原本沒有的，就需要額外加上去。

> 其實自己對這個東西蠻有興趣的，做個註記以後可以看[BlinkOn 会议的一些访谈](https://www.youtube.com/watch?v=Y5Xa4H2wtVA) 

### Paint

打好草稿，那下一個步驟當然就是就是塗色了。不，代誌不是像憨人想的那麼簡單，你忘了考慮分層。剛剛我們定位出了每個元素的 2D 位置，但是每個元素就像紙張一樣，上層會遮蓋掉下層。我們必須要處理這個問題才能夠塗色。

所以瀏覽器會再遍歷一次 Layout tree，看看那些元素屬於上層那些屬於下層，然後得出說：先畫 A, C 再畫 B, D, E 這樣的順序，然後才開始繪製。有點像是一個一個的指令，告訴瀏覽器說先畫出什麼，再畫出什麼，這樣的指令稱作 Paint Record，這也是 Paint 產出的東西。

這裡的 Paint 我的理解比較不像是開始繪製，而是制定一個繪製的順序。

### Composite

再理解這個步驟之前要先了解一個東西，叫做 Raster（光柵化），

Chromium 會把所有的元素先分層然繪製出來。接著在合成 viewport 內的內容（這部分建議看文章，或是文章裡的這個[動畫](https://developers.google.com/web/updates/images/inside-browser/part3/composit.mp4)，用講得實在是很抽象），就像把整個內容全部都擺好，然後再用一個框來取景。這樣可以讓滾動更加滑順，因為內容都已經擺擺好了，只需要重新合成框框裡面的內容就好了。Composite 裡面又可以分為三個步驟。

1. 分層
2. 光柵化
3. 合成

第一是分層。這個步驟 rederer Process 的 Main thread 會上一個步驟的 Layout tree 轉化成不同層的 Layer tree，也就是決定說那些東西要畫在同一層。我們可以透過 `will-change` 這個屬性，來強制幫元素分層，如果是舊的瀏覽器可以使用 `translateZ(0)`。文中是沒有特別提到說除了上面兩個 CSS 屬性以外有沒有其他分層的依據，不過我猜應該是有，除了強制分層應該也是會有一些基本的分層方式。

有了 Layer tree 之後，Main thread 會把 Layer tree 的內容交給 composite thread，而 composite thread 會在把每一層的畫面切分之後，再交給 raster thread 進行 raster。

這部分也會涉及優化，整個 Layer 很大，可能跟網頁一樣大。瀏覽器會優先處理比較靠近視窗的部分（接下來可能會瀏覽到的部分）。而且再切分時還會考慮到使用者可能會放大縮小，會把整個畫面切分成不同的大小再進行 raster。

Raster 是啥？我們都知道說螢幕是由很多像素所組成的，但是瀏覽器裡面的資料會像這樣：

```
from 1,1  
to 10,1
to 10,10
to 1, 10
end 1, 1
```

螢幕是看不懂這個東西的，他只知道什麼座標的像素要呈現什麼顏色。把向量的內容變成螢幕可以呈現的點陣圖像就是 Raster。

當瀏覽器會每一層都 Raster 好之後，就會開始合成。合成的概念跟 Photoshop 的影像平面化的概念很像，前面我們已經把每一層都 Raster 成點陣影像像這樣：

```
                 viewport    
Layer 1     |          ccc     |
Layer 2     |      bbbbbbbbbbbb|bbbb
Layer 3  aaa|aaaaaaaaaaaaaaaaaa|
```

接下來我們只取 viewport 裡面的畫面，然後再把所有 Layer 合成一個畫面，就變成下面這樣：

```
composite   |aaaaaaaaaacccbbbbb|
```

到這裡我們就把一個 frame 處理好了，但只是一個。平常我們看影片的大概是一秒 30 張圖？電腦的操作必須要到一秒 60 幀（前面的"張"就是"幀"的意思）才夠滑順，當我們在滾動畫面的時候其實網頁是不斷地執行最後這個 composite 這個動作。但如果你有改變網頁中的元素，那就會需要重新 Parse，然後重新 render 了。

### 效能優化

就像剛剛提到的，如果 JS 導致畫面上新增元素，或者是有動畫呢？我們可以從頭檢視 render 的步驟（詳細屬性是甚麼可能要再查詢，這邊只是大致分而已）

1. Parsing：html ,JS
1. Sytle Computed：CSS seletor
1. Layout：layout property
1. Paint：Paint property
1. Composite： Compositor-Only Properties
    1. 分層
    2. raster
    3. 合成畫面

JS 會在最一開始被解析，而不同的 CSS 的屬性會在 render pipeline 的不同階段實現，當我們在利用 JS 新增元素時，Layout 跟 Paint 都需要重新執行（style computed 可能不用，看新增的元素有沒有 CSS）。

而且從 Parsing 到 Paint的步驟都是在 renderer Process 的 Main thread 處理的，這是一個同步的過程（前面做完後面才能繼續執行）。假設這一個整個 render 畫面的流程超過 1/60 秒呢，尤其是 JS 執行的時間很容易就超過這個時間（JS 會在 Parse 階段就被解析執行）。剛剛有說過要一秒 60 幀我們肉眼才會覺得畫面滑順，如果網頁上有動畫，但 render 的運算速度超過 1/60 秒，那就會造成卡頓。

要避免 JS 的執行阻塞到 render，理論上可以把 JS 切開來執行，或者是用 web worker 讓 JS 獨立到另外一個 thread。至於純粹 CSS 的 animation 或者是 transition ，大方向是不要影響到大部分流程的重繪，像是可以使用 Compositor-Only Properties：transform 、Opacity來處理動畫，就比使用 top, bottom 等 Layout property 來的節省資源。

> 在想 render 的步驟可能跟計算機圖學有關，後來發現 illustrator 的輸出也有類似的方法。

## Part4 input 事件的觸發


### 我們的操作怎麼觸發 event
接下來要提 input，input 不只是輸入東西而已，所有對網頁的操作對瀏覽器而言都是 input。前端當然很了解哪些東西是 input，畢竟每個學 JS 都會知道  `addEventListener`。那從瀏覽器的角度看，我們的操作是怎麼觸發 EventListener 的？

我們可能會以為是某個按鈕的範圍可以接收到我們的 click，錯，這就是菜鳥工程師的自私想法，一點都沒有顧慮到瀏覽器。

當你進行某個操作時，操作的到的是 Browser Process。也就是你到的是瀏覽器，不是網頁。 Browser Process 會把你點擊到的座標以及事件傳給 Renderer Process。那 Render Process 會怎麼處理呢？

這裡先等等，我們先看看 Event Listener 是怎麼加進去的。

當你為 element 加上 Event Listener 之後，Composite thread 會把 element 的範圍登記為 non-fast scrollable region。

當座標傳進 Render Process 之後會經歷以下步驟

1. 這個座標是不是在 non-fast scrollable region 裡面
2. 會透過 Paint Record，查找說這個位置有繪製甚麼元素
3. 觸發事件

若 1. 的步驟成立，Compisite thread 就會把 event 丟到 Main thread 處理。所以才會稱作 non-fast scrollable region （非立即滾動區），因為當這個區域中發生事件之後，就必須處理完事件還有 callback 才能夠繼續 render 畫面（還記得 JS 的執行是在 Parse 階段，導致阻礙到後面事件的執行），但是這樣就會造成卡頓，可以加上 `passive:true` 來讓 callback 不要阻礙到後面程序的執行。

這邊自己在想說是不是就是讓 callback 變成非同步的意思，讓 render 後續的程序跟 callback 並行執行。我想這應該不是完全沒有風險，還有想到一個情況是有可能還沒 render 好，callback 就跑好，但是又影響到 DOM， 那就又需要重新 render，這樣就會造成浪費資源。

### passive:true 帶來的 preventDefault() 延遲問題

文中還有提到一個狀況是說，如果你將 callback 和 render 同步運行。那麼在 callback 還沒執行到 preventDefault() 時，預設的事件可能就已經送出了，文中的是用橫向的 pointermove（觸控螢幕的滑動） 來舉例。

```
document.body.addEventListener('pointermove', event => {
    if (event.cancelable) { //cancelable 只是為了確認說這個 event 能不能取消
        event.preventDefault(); // block the native scroll
        /*
        *  do what you want the application to do here
        */
    }
}, {passive: true});
```

為了不讓預設的垂直滾動運行，我們會執行 preventDefault()，而且又為了可以讓橫向滾動更滑順而加了 `passive: true`。但卻因為 `passive: true` 的關係，不會等待 JS 運行，導致說 JS 可能還沒運行到 event.preventDefault()，來阻止預設的垂直滾動行為，就先進行後面 render 的步驟，viewport （畫面）就會先向下滾動。

```
原本的狀況
|---------preventDefault()--------||----scroll-----|
JS                                  後面的 render步驟

passive:true
|----scroll-----|
|---------preventDefault()--------|
scroll 先被觸發了，才進行進行 preventDefault()
```

要解決這樣的狀況，可以直接使用 `touch-action: pan-x` 直接禁止掉橫向移動。其他事件也是同樣道理，可以找到禁止 event 的 CSS。

### event delegation 的效能問題 

另外一個要知道的是 event delegation。如果你在母元素上加上 listener，相當是把整個母元素都變成 non-fast scrollable region。就變成要隨時監聽母元素的 event，但範圍太大（你把 body 設為 delegation），就會非常的耗費資源。

### 連續事件的節流

像是滑鼠滾動、移動等等的事件，滑鼠一秒會觸發大概一百次，這些是見我們稱為 continuous events（連續事件） ，這個數字超過我們螢幕更新的頻率，為了節省資源，瀏覽器會把 1/60 秒內的事件合併成一次，這種把一定時間內的觸發事件合併成一次來節省資源的模式稱作 throttle（節流）。

但節流不一定是好的，假設我們在做一些繪圖軟體，反而會因為觸發事件被合併，而忽略了一些細節，在 event 中，我們可以用 event.getCoalescedEvents() 來獲得原始的數據：

```js
window.addEventListener('pointermove', event => {
    const events = event.getCoalescedEvents();
    for (let event of events) {
        const x = event.pageX;
        const y = event.pageY;
    }
});
```


從這個 API 看來，每一次的 event 其實都會被監聽到，但是會有一個 throttle 來降低觸發的頻率（忽略一些觸發）。而 `event.getCoalescedEvents()` 就是可以跳過 throttle 的控制，直接接受 event。

### 網站優化
其實講那麼多，為什麼我們要理解瀏覽器？無非就是想要優化網站的性能。但是要優化總不能以順不順這種主觀的感受來判斷，文中也提供了一些資源：

- LighHouse 可以幫你的網站評分，來告訴你說你的網站有哪些做的比較不好而且可以怎麼改善，打開 Devtools 的更多工具就可以用了，而且不只效能優化，還有 Web accessibility, SEO 等等指標 

- [Optimize Website Speed With Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/speed/get-started) 來看說怎麼用 Devtools 來優化網頁效能。
- [Feature Policy](https://developers.google.com/web/updates/2018/06/feature-policy) 裡面告訴你說一些網頁的雷不要踩。

## 後記

原本只是想做個筆記的，沒想到打了蠻多東西的，這篇文章不是什麼很嚴謹的內容，更不是什麼把很難的內容變得簡單那種很偉大的東西，只是自己對於這幾篇文章思考的結果而已。

瀏覽器的東西博大精深，這是篇很好的入門點，身為菜鳥工程師的自己看完這幾篇也覺得說自己的腦袋炸了，如果這一篇能夠幫助到和我一樣的人真是再好不過了。


參考資料：  
[[译] 现代浏览器内部揭秘（第四部分）](https://juejin.im/post/6844903695600058375)  
[[译] 现代浏览器内部揭秘（第三部分）](https://juejin.im/post/6844903692894732295)  
[[译] 现代浏览器内部揭秘（第二部分）](https://juejin.im/post/6844903692890537992)  
[[译] 现代浏览器内部揭秘（第一部分）](https://juejin.im/post/6844903679389073415)  
[Inside look at modern web browser (part 1)](https://developers.google.com/web/updates/2018/09/inside-browser-part1)  
[Inside look at modern web browser (part 2)](https://developers.google.com/web/updates/2018/09/inside-browser-part2)  
[Inside look at modern web browser (part 3)](https://developers.google.com/web/updates/2018/09/inside-browser-part4)  
[Inside look at modern web browser (part 4)](https://developers.google.com/web/updates/2018/09/inside-browser-part4)  