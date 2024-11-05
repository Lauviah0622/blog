---
title: 譯：UI 工程的要素 - The Element of UI Engineer from Dan Abramov
pubDate: 2024-11-06T00:00:00.000Z
tags:
  - UI
layout: /src/layouts/Post.astro
---

翻譯自：[Dan Abramov - The Elements of UI Engineering](https://overreacted.io/the-elements-of-ui-engineering/)，所有著作相關權利歸原作者 [Dan Abramov](https://twitter.com/dan_abramov2) 所有，如有任何問題歡迎透過留言或透過 [email](mailto:lavi_fang@proton.me) 聯繫。


## 本文

在我[上一篇文章](https://overreacted.io/things-i-dont-know-as-of-2018/)，我談到承認我們的知識上的差距。你可能認為我建議你安於平庸。但並非如此，這是一個相當廣泛的領域[^15]

我相信不需要依照任何特定順序去學習任何技術，你可以從「任何地方」開始。但我也同時相當重視專長的發展。個人而言，主要關注於建立使用者介面[^2]

**我一直反覆思考什麼是我知道且有價值的**。沒錯，對於一些技術我十分熟悉（例如：JavaScript 和 React），但一些更重要的體會是難以言喻的。我從未將其付諸言辭，這是我第一次嘗試將其歸納並描述。

---

有無數關於技術、以及庫的「學習藍圖」。哪個庫會在 2019 開始流行？那 2020 呢？我應該學習 Vue、React 還是 Angular？Redux 還是 Rx？我應該學習 Apollo 嗎？那 REST 還是 GraphQL 呢？在之中迷失是非常容易的，如果作者的建議有誤怎麼辦？

**我生涯中最大的成長並無關乎任何特定的技術**，反而是在琢磨特定的 UI 問題中學習到最多。有時我會尋找一些有幫助的庫或者模式，有時候則會想出自己的解決方案（不論是好是壞）。

正是這種理解*問題*、嘗試解決方案、應用不同的策略的組合，帶給我人生中最有價值的經驗。這篇文章將關注在這類的問題。

---

如果你也投入於使用者介面，你可能也曾經處理過一部分的挑戰 - 不論透過自己實作、或者是使用一些庫來解決。不論如何，我會建議建立一個不依賴任何庫的小專案，嘗試重現並解決這些問題。每一個問題都沒有所謂的標準答案，學習的收穫來自於探索這些問題的範疇，以及對於不同方案取捨之間的嘗試。

---

- **一致性**：當你按「讚」，然後文字更新：「你以及其他三人對這篇貼文按了讚」。然後再點一次，文字又回到原本的狀態。這聽起來很容易，但這樣的標籤可能存在於頁面[^5]中好幾個不同的位置，可能還有其他的視覺提示（例如按鈕的背景）也需要改變。之前從伺服器請求 hover 時顯示的「按讚者名單」，現在應該要加上你的名字。如果你瀏覽到其他頁面後再返回上一頁，這篇貼文不該「忘記」它曾經被按讚過。就算僅僅是本地的一致性也會帶來一系列挑戰，其他用戶也可能修改了目前顯示的資料（例如其他用戶點了目前貼文的讚）。我們應該如何保持頁面不同部分的相同資料？何時、又該如何使本地資料與伺服器資料的一致？反過來呢？


- **回應性**：人們對於缺乏操作後視覺回饋的時間是有限的。在連續的操作：像是手勢以及滾動，這個時間很短（即使只丟失 16 毫秒的影格[^6]也會覺得「卡頓」）。對於*不連續（離散）* 的操作像是點擊，研究顯示，對於 100 毫秒以下的延遲，會視為一樣快速。如果操作需要更長的時間，我們需要視覺上的指示，但也會遇到一些違反直覺的問題。那些導致頁面排版「跳動」或者是多個「載入階段」的視覺指示，會使這個操作感覺起來比實際上更久。同樣的，20 毫秒但丟失動畫影格的操作，*在感受上*可能比 30 毫秒但沒有丟失影格的操作來得更久。大腦並不是 benchmark 工具，我們應該如何保持不同輸入情境的回應性？

- **延遲性**：計算以及網路的存取都需要時間。有時候如果不影響我們在目標裝置上的回應性的話，我們可以忽略計算上的時間成本（確保在低階的裝置上進行應用的測試）。但網路的延遲是不可避免的 - 這可能花上幾秒的時間！我們的應用不可能在加載資料或程式碼時就停滯在哪裡。這代表任何依賴新的資料、程式碼或者資源的操作都可能是非同步的，並且需要處理「載入」的狀況。但每一個頁面都可能發生這種情況。如何優雅的處理延遲，而不是一連串的載入動畫[^7]或只是留下空白的區域？如何避免頁面排版上的「跳動」？如何更換非同步的依賴資源，而不需要每次都「重新載入」我們的程式碼？

- **訪問性**：用戶期待在操作時，介面維持「穩定」。介面上的東西不應該突然在我們眼皮底下消失。不論是透過應用（例如點擊連結），或者是透過外部的操作（例如點擊「上一頁」），都應該遵守這個原則。舉個例子， 同樣在個人檔案頁面， `/profile/likes` 和`/profile/follows` 這兩個標籤區塊之間的切換不應該清除區塊外的搜尋欄。訪問另一個頁面就像走入另一個房間，用戶期待可能在稍候返回時，能夠看到任何留下的物品（或許也會有些新的東西）。如果你在正在貼文串中，這時點擊貼文的個人檔案，然後返回；這時如果失去你原本在貼文串中的位置，或者是需要重新載入內容，這都是很令人沮喪的。如何打造我們的應用，使其能夠任意的訪問但卻不丟失任何重要的上下文資訊。

 - **時效性**[^8]：我們可以透過本地的快取來瞬間訪問「上一頁」。在快取中，我們能夠「記住」些資料來做到快速的存取，即使理論上可以重新獲取資料。但快取也帶來某些問題：快取會過期。如果我們改變我們的頭貼，快取也需要同時更新。如果我發布新的貼文，它也要即時加入快取，或者快取需要被失效。這可能變得複雜或容易出錯。如果發布失敗怎麼辦？快許需要在記憶體中保留多久的時間？如果重新存取貼文，應該「接合[^9]」新存取的貼文和快取中的貼文嗎？還是丟棄快取中的資料。如何表示快取中的分頁以及排序？

- **熵**：熱力學第二定律大致上表示：「隨著時間過去，事物會變得一團糟」（當然，不完全是這個意思）。這也能套用在使用者介面。我們無法預測用戶的確切的操作以及順序。任何時間點，應用可能處在令人眼花撩亂的多種可能存在狀態之一。我們會盡可能的使結果可預測，並且受到設計的限制。可不希望看著錯誤的截圖然後皺著眉頭想著：「這是怎麼發生的？」。對於 N 個可能的狀態，會有 *N * N - 1* 個可能的轉換。舉個例子：如果一個按鈕有五個不同的狀態（normal, active, hover, danger, disabled[^10]），更新按鈕的程式碼就需要有 5 * 4 = 20 種可能的轉換 - 或者捨棄掉某幾種可能。如何控制狀態組合的爆炸成長，並保持視覺呈現的可預測性？

- **優先度**：某些東西可能比其他來的重要。例如：對話框可能要出現在觸發它的按鈕「之上」，並且「超出」所在之容器元素的邊界[^11]。新排定的任務（例如：點擊後的回饋）可能比已開始的長時任務還要重要（例如渲染螢幕外的下一篇文章）。隨著應用的成長，不同人以及團隊的編寫的程式碼會彼此爭奪有限的資源，像是運算能力、網路、頁面狀態以及 bundle size[^12]。有時候能透過一個共同的尺度來訂定彼此的「優先序」[^13]，就像 CSS 的 `z-index` 屬性。[但通常不會有好下場](https://devblogs.microsoft.com/oldnewthing/20050607-00/?p=35413)。每個開發者都偏頗的認為自己是最重要的。如果一切都很重要，意味著沒有任何東西是重要的。如何讓協調各個獨立的 widgets，而不是爭奪彼此的資源？


- **無障礙**：無障礙網站已經不是小眾的需求。舉個例子，在英國，五個人就有一個是障礙者。[這裡有張很讚的資訊圖表](https://www.abrightclearweb.com/web-accessibility-in-the-uk/)。我也能親身體會到這點。雖然我才 26 歲，但閱讀細瘦的字體以及低色彩對比的網站讓我感到吃力。我盡量減少使用觸控板，想到有天不得不用鍵盤操作在那些無障礙導覽作得很差的網站感到憂慮。我們應該不該再讓不便者感到害怕 - 好消息是，很多容易改善的地方，從教育以及工具開始。但我們還需要讓產品開發者更容易做正確的事。我們可以如何讓無障礙變成預設的標準，而不是事後補救。

- **國際化**：我們的應用需要在世界各地運行。人們不只說著不同的語言，還需要讓開發者不費力就能使版面能夠支援左至右的書寫系統。如何在不犧牲延遲和反應性的前提下支援不同的語言？

- **交付**：我們需要把應用的的程式碼傳輸到用戶的裝置。應該使用什麼樣傳輸方式以及格式？聽起來很簡單，但其實在這之中有許多取捨。舉例來說：在應用的容量很大時，原生的應用傾向預先載入所有的程式碼，但代價是龐大的應用大小。而 Web app 傾向在初始化時載入更小的內容，而代價則是在使用中會產生更多的延遲。應該在何時引入這些延遲？如何透過使用模式來優化我們的交付。在這些優化方案中我們需要什麼樣的資料？

- **韌性**：如果你是昆蟲學家，可能會 Bug，但你不會希望它出現在你的程式當中。然而，一些 Bug 可能不可避免的進入到正式環境。在那之後呢？有些 Bug 產生錯誤但在程式上卻是合法定義的行為。例如你的程式碼在某些情況下呈現了錯誤的視覺輸出。但如果渲染的程式碼*崩潰*了？因為畫面輸出將會不一致，將無法進行任何可行的操作。一個貼文的崩潰不應該「拖垮」整個整個貼文串，或者進入半故障的狀態導致更多的錯誤。要如何做到獨立渲染以及資料獲取的錯誤，並保持應用的其他部分運作正常？在使用者介面中，容錯性代表著什麼？

- **抽象**：在小規模的應用中，我們可以手動處理各種上述的各種特殊情境。但當應用的規模增長，我們希望能[重用、衍用、組合](https://overreacted.io/optimized-for-change/)我們的不同部分的程式碼，並共同運作。希望在每個人熟悉的部分中定義出清晰的界線中，並避免經常變動的邏輯過於僵化？如何建立抽象，以隱藏特定 UI 元件的實作細節？當應用成長，如何避免再次引入已解決過的相同問題？

--- 

當然，有許多問題是我沒有提到的。這個清單中的項目還不夠全面！例如我還沒提到設計師以及工程師之間的合作，以及除錯還有測試。如果未來有機會的話。

使用特定的 view library 或者特定的 data fetching library 來理解這些問題是非常誘人的。但我建議假裝這些庫並不存在，並從這些角度再次重新理解。你會如何解決這些問題？在小型的的應用中試著動手看看吧（我很樂意在 Github 上看到你的嘗試，歡迎透過 twitter 分享給我）

更有趣的是，這些問題幾乎會在各種規模的應用中出現。不論是在 Typeahead 或 Tooltip 的小部件中，又或是在大型的應用像是 Twitter 或是 Facebook。

**想想你喜歡的應用中某個複雜的 UI 元素，然後仔細審視清單上的問題。你能夠清楚的敘述開發人員做了哪些取捨嗎？試著從頭重現並模仿他們的行為。**

透過小型應用中，嘗試不使用任何庫而解決這些問題的過程中，我學習到很多關於 UI 工程的知識。我推薦給任何想要對於這些介面工程上的取捨想要有更深理解的人

## 後記

這篇文章大概在一年多前就已經拜讀過（基本上整個 Dan 的部落格都翻過了），一直到現在，這篇文章還是影響自己非常深遠且一直記憶猶新的一篇，很少看到資訊對所謂 UI 工程有這樣完整的見解。投入前端開發一段時間，有時候也會懷疑這是不是個缺乏深度的領域？但這篇文章總是會點醒自己：你所知道的還只是冰山一角罷了。

翻譯文章也是件有趣的事。在這個 AI 當道的時代，人工的翻譯的價值還剩下多少？親自去翻譯一篇文章後才知道，字裡行間中還是有很多細節需要注意的。用字遣詞要怎麼表達出原文的帶來的情緒？不同文化的表達應該如何轉換？要怎麼在幾個同義詞中選出最適合的語境的那個？如果你要的只是「資訊」，直接餵給 AI 肯定是最快的方法。但字裡行間承載的從來不只有資訊，即使是訴諸理性的技術文章，也能感受到作者的性格以及傳達的意念，這些抽象的感受只能透過親身體會。就連人工的翻譯，也僅僅是「盡可能」的傳達而已。但這些抽象的「感受」，比起純粹的「資訊」，總是會引發更多的思考。

最後，我不是專業譯者，也相信還有很多詞不達意的地方，對內容有問題或想要更深的理解，還是推薦閱讀[原文](https://overreacted.io/the-elements-of-ui-engineering/)


[^2]: 譯註：參照教育部翻譯
[^5]: 原文 screen，翻譯成「頁面」
[^6]: 原文 frame，翻譯成「影格」
[^7]: 原文 spinner，翻譯成「載入動畫」
[^8]: 原本 staleness，翻譯成「時效性」
[^10]: 這裡我想用原文會清楚很多，所以保持英文
[^12]: 同樣 bundle size 維持原文會比較清楚
[^13]: 這一句翻的不是很好，這裡列出原文：Sometimes you can rank the contenders on a shared scale of “importance”, like the CSS `z-index` property.
[^15]: 譯註： 這裡指的是[上一篇文章](https://overreacted.io/things-i-dont-know-as-of-2018/)中提到的領域，大部分圍繞著網頁前端開發