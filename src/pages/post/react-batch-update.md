---
title: React 的 batch update 策略，包含 React 18 和 hooks
pubDate: 2021-06-09T00:00:00.000Z
tags:
  - react
layout: /src/layouts/Post.astro

---
在面試時有一題讓自己印象深刻：

```jsx
export default function App() {
  const [counter, setCounter] = useState(0);
  
  const handleClick = () => {
      setCounter(counter + 1);
      setCounter(counter + 1);
  }

  return (
    <div className='App'>
      <h1>Function Component</h1>
      <div>
        counter: {counter}
      </div>
      <br/>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

[CodeSandbox 連結](https://codesandbox.io/s/wild-platform-w801i?file=/src/App.js:39-424)

第一個問題是：上面的 code，即使點擊一次 button，`counter` 也只會 + 1，原因是什麼？

我的回答是：
> 因為 `setCounter(counter + 1);` 這段已經改變 state 了，所以當下 Component 就會被 rerender，那後面第二次的 `setCounter` 就不會被執行。

後面緊接著第二個問題：如果上面的 Code 要改成 +2，你會怎麼做？

自己是有回答的出來（有做到 +2 的需求），不過主管表示說解題的方向不對，這題主要是在考 batch update 的觀念。

後來查了一下，回頭發現連第一題都回答錯了（慘爆）。了解之後就想寫篇文章分享這個觀念。

## 什麼是 Batch Update

在 React 裡面，不管是 state 或者是 props 的改變都會造成 Component 的 re-render，這點在使用 hook 或者是 class component 中都一樣。

那如果當一個操作中多次改變了 state，是不是就會造成 component 多次 rerender 呢？那對應的就會造成資源耗損，所以這時候就會將所有的改變 state 的操作一次蒐集起來，再統一改變 state，這樣就只需要 re-render 一次就好了，這個就是 Batch update。

那 React 的 Batch Update 是怎麼做的？我們可以看看 React 作者之一 Dan 的 [文章](https://overreacted.io/react-as-a-ui-runtime/#batching)中的範例，這邊擷取文章中的一部分範例以及原文。但個人還是推薦去閱讀 Dan 的真跡，每一篇文章都受益良多。

```jsx
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

當你在點擊 `Child` 中的 button 時，因為 [event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture) 的關係，所以也會連帶觸發到 `Parent` 中 `div` 的 `onclick` 事件。如果在沒有 batch update 的狀況下，會是這樣 re-render 的

```
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 不需要的 re-render
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

Child 因為自己的 setState 而 re-render 一次，但又因為 Parent 的 state 改變而 re-render 第二次。

但是在 React 中，對於 event handler 中的 update 有進行 batch update 的處理，所以實際上的方式會是這樣：

```
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

這樣就減少了一次 re-render 了！真棒！

理解了 React 中 batch update 的觀念後就可以來看面試題了，這裡再放一次 code

```jsx
export default function App() {
  const [counter, setCounter] = useState(0);
  
  const handleClick = () => {
      setCounter(counter + 1);
      setCounter(counter + 1);
  }

  return (
    <div className='App'>
      <h1>Function Component</h1>
      <div>
        counter: {counter}
      </div>
      <br/>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

> 第一題：
> 上面的 code，即使點擊一次 button，`counter` 也只會 + 1，原因是什麼？

原因根本不是如自己說的，因為第一次的 setCounter 就已經觸發 re-render，所以第二次的 setCounter 就被忽略。雖然和 Dan 的例子不太一樣，但是在同一個 Component 中的 event handler 也是會進行 batch update 的。

等等，那不就應該 +2 才對嗎？怎麼會是 +1？

原因出在這段：
```js
setCounter(counter + 1);
setCounter(counter + 1);
```
當這段 code 被送出去時，state 的指向的是目前的這個狀態的 state（詳細可以看[這篇](https://overreacted.io/zh-hant/a-complete-guide-to-useeffect/) Dan 的文章，雖然很長），換句話說，這段可以看成這樣：
```js
setCounter(0 + 1);
setCounter(0 + 1);
```

所以等於設定了兩次 `setCounter(0 + 1)`。檢查方法很簡單，在 eventHandler 後面 `print` 出一點東西就知道有沒有執行到最後了。

那第二個問題：

> 如果上面的 Code 要改成 +2，你會怎麼做？

只要改成這樣就可以了

```js
const increase = prevCounter => prevCounter + 1
const handleClick = () => {
      setCounter(increase);
      setCounter(increase);
  }
```

利用 setState 的 [functional update](https://reactjs.org/docs/hooks-reference.html#functional-updates)，那就會變成「前次值 + 1」，而不是指定數字。就能夠達到 +2 的需求了。

## 目前如何該使用 Batch Update
了解什麼是 batch update 後，可以開始了解說哪裡會進行這樣的處理。

### React 中的 Batch update
#### event Handler
Handler Batch 範例：https://codesandbox.io/s/romantic-sanne-e9hgs-e9hgs?file=/src/HandlerBatchSample.jsx

可以看到不管是點擊 `add many local state`，還是點擊 `increace all State in Another Component`，render 次數都只會新增 1。只要是單次的 event 中的所有的 state change 都會被 batch 起來，即使在不同的 component、不同的元素也都會做 batching。面試題也屬於這個狀況。

#### useEffect
Effect Batch 範例：https://codesandbox.io/s/affectionate-carson-2jovc?file=/src/EffectBatchSample.jsx

同樣的 useEffect 中也會。範例中改變 toggle 後，useEffect 被觸發，進而其中多個 `setCounter`，但是卻沒有被 rerender 四次。證明說有進行 batch。

那為什麼每次點擊之後 counter 都會 +2 呢？原因是因為，couter 的 useEffect 並沒有設置 dependency，所以會在每次 render 的時候被觸發，所以：
1. 第一次為 toggle 改變的時候被觸發
2. 第二次為 couter 改變的時候被觸發

> 話說這裡有個問題，還有除了這兩種操作 State 以外的情境嗎...？

#### 非同步操作和 `ReactDOM.unstable_batchedUpdates()`
再回頭看 Event Handler 的範例中，如果點擊 `async increase all state`，就會依照我們原本預期的重新 render 4 次（在其中操作 state 4 次）。React 在非同步的操作中並不會自動執行 batch State。

但可以使用 `ReactDOM.unstable_batchedUpdates(callback)`，將操作包在 callback 裡面，那一樣會進行 batching。

### Redux 的 Batch
在 Redux 裡面也有 [batching](https://react-redux.js.org/api/batch)，可以使用 `batch` 這個 API 一次 dispatch 多個 action，避免多次的 rerender。

## React 18 的 Batching
Dan 在 [Keep to single setState call？](https://link.zhihu.com/?target=https%3A//github.com/facebook/react/issues/10231) 這份 issue 裡面有提到：

> There exists a temporary API to force batching. If you write `ReactDOM.unstable_batchedUpdates(() => { this.fn1(); });` then both calls will be batched. But we expect to remove this API in the future and instead batch everything by default.

是的！就是現在！[react 18 ](https://github.com/reactwg/react-18) alpha 版釋出啦，其中就有實現上面提到的方式。可以參考其中一篇 [discusstions：Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21)，那這邊也稍做介紹

在新的 React 18，所有的狀況都會預設進行 batching（原本在非同步的狀況不會進行）。而如果有需要即時更新 state 來讓 DOM 渲染的話，則可以使用新的 API `ReactDOM.flushSync()`，使用方法如下，範例[來自](https://github.com/reactwg/react-18/discussions/21)

```js
import { flushSync } from 'react-dom'; // Note: react-dom, not react

function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // React has updated the DOM by now
  flushSync(() => {
    setFlag(f => !f);
  });
  // React has updated the DOM by now
}
```

用法算是反過來，你想要剝離的操作，用 flushSync 包起來，而想要 batching 的操作就維持原狀。自己稍微測試的結果，`ReactDOM.flushSync()` 裡面的 state change 會先於 batching，不論在執行時的順序。不過這樣一來，原本的 `ReactDOM.unstable_batchedUpdates()` 就可以說是被棄用了。


## 結語
整個研究的過程蠻久的，從面試題完到現在寫完文章，有趣的是剛好搭上 React 18 更新也稍微研究一下 XD。

Big guy is John，如果有任何問題或錯誤的部份歡迎留言或者是寄信，會超級感謝！！

## 參考資料

- [深入 react 细节之 - batchUpdate](https://zhuanlan.zhihu.com/p/78516581)有稍微提到 source code
- [React State Batch Update](https://medium.com/swlh/react-state-batch-update-b1b61bd28cd2)，少數提到 useEffect 也有做 batching  

範例大部分參考自上面兩篇文章  

- [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/#batching)
- [Automatic batching for fewer renders in React 18 #21](https://github.com/reactwg/react-18/discussions/21)
- [react 的 BatchUpdate](https://github.com/Rashomon511/MyBlog/issues/27) 沒看完，太多 source code 有點吸收不下




