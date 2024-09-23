---
title: Function as State, Take useState as Example
pubDate: 2024-09-22T00:00:00.000Z
tags:
  - react
  - UI
author: Lavi
layout: /src/layouts/Post.astro
summary: 用了 React 這麼久，你的 useState 過去都放了什麼？
---

作為 React 使用者，你的 useState 過去都放了什麼？`useState` 的官方敘述是這樣：

> `useState` is a React Hook that lets you add a [state variable](https://react.dev/learn/state-a-components-memory) to your component.

而 useState 的[型別](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/v17/index.d.ts#L926)是這樣的

```
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
```

看起來 `useState` 對於 state 的類型好像沒有任何限制，換句話說所有 JavaScript 中可以用的值都可以使用。那接著複習一下 JS 有哪些 data type[^1]

![Javascript value data types](/assets/images/post/20240924_func-as-state_1.png)

> 咦？你有把 function 放進 state 過嗎？


## 如何將 function 放入 useState

首先，function 放進 `useState` 是完全可行的，只是有些地方要注意。

第一直覺你可能想到的是這樣的寫法：

```ts
const [fun, setFun] = useState(() => {
    console.log('init func')
  })
```

```
console.log(fun) //undefined
```

但實際上你儲存的值是 `undefined`。還記得剛剛的型別嗎？

```
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
```

在 React 的文件[^2]中寫到

> If you pass a function as `initialState`, it will be treated as an _initializer function_.

當在 `useState` 傳入 function，會在 component 初始化的時候執行並帶入 return 值。因此不能直接傳入 function，而是要用下面的形式：在 function 中 return function

```ts
  const [fun, setFun] = useState(() => () => {
    console.log('init func');
  });

  console.log(fun); //  f () => { console.log('init func'); }
```

同樣的，在 `setState` 也有一樣的狀況，你不能直接用下面的形式來設定 function

```js
setFun(() => {console.log('set func')})
```

> If you pass a function as `nextState`, it will be treated as an _updater function_.

在 `useState` 的 setter 當中直接使用 function 的形式，代表傳入的是 updater，會依照 return 的值來決定下一個 state。所以應該這樣作：

```js
setFun(() => () => {console.log('set func')})
```

知道一些小訣竅之後，可以來看一些使用上例子

## 如何使用


舉個例子，今天有個簡單的計算機：

![Calculator UI](/assets/images/post/20240924_func-as-state_2.png)

- 可以執行 `f(a, b) = x` 
- 中間的 button 是可以執行的運算，也就是指定 `f` 是什麼
- 深灰色是可以輸入的 `a`, `b`
- 淺灰色底是結果 `x`

過去可能會這樣寫（刪除了與主題不相關的程式碼）

```tsx
export function OldArithmetic() {
  const [operation, setOperation] = useState('+');
  const operationsMap: Record<string, (a: number, b: number) => number> = {
    '+': (a: number, b: number) => a + b,
    '-': (a: number, b: number) => a - b,
    '*': (a: number, b: number) => a * b,
    '/': (a: number, b: number) => a / b,
    '**': (a: number, b: number) => a ** b,
  };

  return (
      {//...}
      <button onClick={() => {setOperation('+')}}>+</button>
      <button onClick={() => {setOperation('-')}}>-</button>
      <button onClick={() => {setOperation('*')}}>*</button>
      <button onClick={() => {setOperation('/')}}>/</button>
      <button onClick={() => {setOperation('**')}}>**</button>
      <span >{`= ${operationsMap[operation](operands[0], operands[1])}`}</span>
  );
}
```


<iframe src="https://codesandbox.io/p/github/Lauviah0622/Fun-as-state/main?import=true&embed=1&file=%2Fsrc%2Fexample%2FArithmetic.tsx"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Lauviah0622/Fun-as-state/main"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

> github: https://github.com/Lauviah0622/Fun-as-state/blob/main/src/example/LegacyAtithmetic.tsx

但其實可以省掉 `operationsMap`，直接在 operation 中放入 function 

```tsx
function Arithmetic() {
  const [operation, setOperation] = useState(
    () => (a, b) => a + b
  );

  const [operands, setOperands] = useState([1, 2] as [number, number]);
  return (
      <button onClick={() => {setOperation(() => (a, b) => a + b)}}>+</button>
      <button onClick={() => {setOperation(() => (a, b) => a - b)}}>-</button>
      <button onClick={() => {setOperation(() => (a, b) => a * b)}}>*</button>
      <button onClick={() => {setOperation(() => (a, b) => a / b)}}>/</button>
      <button onClick={() => {setOperation(() => (a, b) => a ** b)}}>**</button>
      <span className='result'>{`= ${operation(operands[0], operands[1])}`}</span>
  );
}
```

<iframe src="https://codesandbox.io/p/github/Lauviah0622/Fun-as-state/main?embed=1&file=%2Fsrc%2Fexample%2FArithmetic.tsx"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Lauviah0622/Fun-as-state/main"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

> github: https://github.com/Lauviah0622/Fun-as-state/blob/main/src/example/Arithmetic.tsx

沒有其他考量的狀況下，這樣的寫法會比 `operationsMap` 更簡潔，並帶來幾個好處

1. 每個 Operation 之間是完全獨立的
2. Operation 自己更加內聚

在原本的寫法中，不同的 operation 被放在同一個 operationsMap 中，透過不同的 key 來辨識。但這也意味著 key 之間不能重複（當然你也可以用 symbol 解決這個問題），使用 function 的形式減少了各 operation 之間的耦合

除此之外，Operation 的 UI 以及行為可以進一步的都包含在一個元件當中，像這樣：

```tsx
const Add = ({setOperation}) => <button onClick={() => {setOperation(() => (a: number, b: number) => a + b)}}>+</button>
```

```tsx
<Add  setOperation={setOperation}/>
<Minus  setOperation={setOperation}/>
<Multiply  setOperation={setOperation}/>
<Devide  setOperation={setOperation}/>
<Pow  setOperation={setOperation}/>
```

這樣的寫法比起將操作和介面當需求有任何變動，像是突然不需要 `Pow` 了，那就直接刪除 `<Pow/>` 的程式碼就好，不需要再對 `operationsMap` 進行改動。

## 實際應用：在 react 中將非同步函數變成同步的形式

假設有這樣一個需求：

![Amount exchange UI](/assets/images/post/20240924_func-as-state_3.png)

- 像上面的介面，可以指定貨幣來透過 API 拿到匯率轉換後的金額
- 金額可以自由輸入，除了有一些常用的金額外，金額可以自由輸入

匯率轉換 API 的格式會像這樣

```ts
(amountsList: number[], Currency) => exchangedAmountList: number[]
```

---

一開始可能會思考這裡有幾個狀態
- 金額的 input 輸入框
- 指定的貨幣
- 轉換後的金額 （server state）

所以可能會這樣寫

```ts
 const [amount , setAmount] = useState(0) // 金額的 input 輸入框
 const [amountsMap, setAmountsMap] = useState(
    new Map<number, number | null>([
      [5, null],
      [10, null],
      [100, null],
      [1000, null],
    ])
  ); // 轉換後的金額，還沒轉換所以放入 null
  const [currency, setCurrency] = useState<Currency>('USD'); // 指定的貨幣
```

有了狀態之後再串上 User 的互動，包含金額的 input 以及貨幣的 select。並且加上呼叫 API 的時機，包含元件初始化、貨幣被選擇以及輸入金額之後。簡單的實作會像下面這樣：

<iframe src="https://codesandbox.io/p/github/Lauviah0622/Fun-as-state/main?embed=1&file=%2Fsrc%2Fexample%2FLegacyExchange.tsx"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Lauviah0622/Fun-as-state/main"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

> github: https://github.com/Lauviah0622/Fun-as-state/blob/main/src/example/LegacyExchange.tsx

這樣的實作沒有問題。但做到這裡的時候不禁會想

> 要是匯率的轉換是一個簡單的同步 function 就好了

如果是一個同步的 function，我們只需在要轉換的地方簡單的加上下面這行就萬事 OK

```tsx
exchange = (number) => number

exchange(amount)
```

如果是這樣的形式，即使要轉換的數字事先不確定個數、不知道數字，全部都直接用一個 `exchange(price)` 就可以解決。

有可能做到嗎？或許可以用將 function 存入 state 的作法來試看看。但首先，先思考理想中的使用方法會是什麼？讓我們回到剛剛 API 的 interface：

```ts
(amountsList: number[], Currency) => exchangedAmountList: number[]
```

用了類似 Currying 的概念，我們可以把這個 interface 轉換成這樣，先指定貨幣，然後產生出另一個「轉換的函數」

```ts
(Currency) => (amountsList: number[]) => exchangedAmountList: number[]
```

單單把後面這段擷取出來和期望的 interface 作比較。

```tsx
// expect
exchange = (number) => number 

// now
exchangeAmounts = (amountsList: number[]) => number[]
```

其實已經很相似了，但一個是拿單一的值，另一個是轉換整個 Array。既然 input / output 都是 Array，那有個大膽的想法：我們或許可以透過某種以「 index 作 mapping 」的方式來解決。

到這裡確定了兩個想法：

1.  可以將原本的 API 的 interface 拆分成兩個階段：先給貨幣，這樣就可以拿到轉換的函數。
2. 需要某種以「 index 作 mapping 」的方式，將原本 Array 的介面轉成單一值的介面。

針對第一點，在 React 中可以利用 Custom hooks 來實作出這樣的一個介面：


```tsx
const useExchange = (Currency) => (number) => number

// In component
exchange = useExchange()

// in render
exchange(amount)
```

如此，可以開始思考 `useExchange` 的實作。Function 之所以比起純粹的 Value 還要有彈性，在於設定是「行為」，而不單只是「值」。回到需求，可以這樣分析整個功能的狀態：

![UI state diagram](/assets/images/post/20240924_func-as-state_4.png)

透過 function 可以設定「行為」的優點，我們可以在不同的狀態設定 function 不同的「行為」：
- 還沒有轉換後的金額：把需要轉換的值儲存起來
- 有轉換後的金額：顯示拿到的轉換後金額

從這個想法出發的實作會像這樣：

```tsx
const useExchange = (targetCurrency: Currency) => {
  // 用來儲存需要轉換的金額，以及轉換後對應的結果
  const amountsRef = useRef<Map<number, number | null>>(new Map());
  const [exchange, setExchange] = useState<(v: number) => number | null>(
    // 在一開始還沒有轉換後金額的階段，function 做的是把值放入 Ref 中
    () => (value: number) => {
      amountsRef.current.set(value, null);

      return value;
    }
  );

  const fetchExchange = () => {
    const amounts = [...amountsRef.current.keys()];
    asyncAmountExchange(amounts, targetCurrency).then((res) => {
      const nextMap = new Map();

      // 把轉換前轉換後的金額儲存在 Map 當中
      res.forEach((exchangedAmount, i) => {
        const originAmount = amounts[i];
        nextMap.set(originAmount, exchangedAmount);
      });

      amountsRef.current = nextMap

      setExchange(
        // 既然有了值，那 function 的行為就變成拿取轉換後的金額
        () => (value: number) => {
          return amountsRef.current.get(value) ?? null
        }
      );
    });
  };

  return exchange
};
```

最後再加上一點小東西
- 在 input `onBlur` 的時候重新拿取需要的轉換金額
- 在貨幣轉換的時候重新拿取需要的轉換金額
- 清除沒用到的值

下面就是我們最後的成果：

<iframe src="https://codesandbox.io/p/github/Lauviah0622/Fun-as-state/main?embed=1&file=%2Fsrc%2Fexample%2FAsyncAsSync.tsx"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Lauviah0622/Fun-as-state/main"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

> github: https://github.com/Lauviah0622/Fun-as-state/blob/main/src/example/AsyncAsSync.tsx


## Conclusion

現在大多數的語言都支持 [First-class function](https://en.wikipedia.org/wiki/First-class_function)，也就是 function 和其他資料結構是沒有差異的，同樣可以作為參數、return 值，也當然可以儲存在變數中。但這樣的特性可以帶來什麼樣的意義，一開始對我而言是難以理解的。

或許可以思考函數有哪些特性：

- 函數是一個動態的「行為」
- 函數有自己的作用域，作用域可以用來儲存變數
- 函數可以有「副作用」，也就是改變作用域外的值
- 函數也可以「沒有」副作用，單純作為一個映射或者是變換
- 函數可以用來隱藏實作，建立另一個介面
- ...族繁不及備載

思考一下這些特性有沒有被能夠被使用在狀態的可能性？這樣的應用雖然與過去對於「狀態」的思考方式大相逕庭，但從另一個角度來看「狀態」也是蠻有趣的 🤔

最後值得一提的是，每次下手前或許可以再稍微想想：

> 恩？是不是有更方便使用以及更好維護介面

總之，不論是什麼方法論，讓程式碼更加內聚並解耦是維持 Code base 彈性的不二法門。



[^1]:  [ECMAScript® 2024 - Primitive value](https://tc39.es/ecma262/2024/#sec-primitive-value), [ECMAScript® 2024 - Data Types and Values](https://tc39.es/ecma262/2024/#sec-ecmascript-data-types-and-values)
[^2]: [useState – React](https://react.dev/reference/react/useState#parameters)