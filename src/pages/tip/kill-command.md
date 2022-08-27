---
title: lsop 的簡單應用：幫你關閉指定 port 的 process
pubDate: 2022-08-27T00:00:00.000Z
tags:
  - command
  - unix
layout: /src/layouts/Post.astro

---
之前遇到一個問題，因為在開發的時候會需要在 terminal 中開不少 local server，但是我卻忘記自己到底是在哪一個 terminal 開了，但是又懶得一個一個翻...

後來找到這個指令[^1]，透過這個指令可以搜尋目前電腦上有在監聽 request 的 process。這樣就可以透過 [process ID](https://en.wikipedia.org/wiki/Process_identifier)，來終止程序。

```
lsof -n | grep LISTEN
```

lsof 是 list opened file[^2] 的縮寫，lsof 除了能夠列出 process 開啟的所有檔案，也會同時查找已經打開的 network socket，並列出使用什麼 PORT，以及針對 socket 類型去篩選。可以透過這樣的方式來找到開啟的 process，進而關掉程序。簡單的解釋一下上面這行指令做了什麼

- `-n` 這個參數可以避免 lsof 去查找 network file 的 host name，不查找 host name 會讓整個程序增快
- `|` 這個 command 是 pipeline，能夠將上一個 process 的 output 放進下一個 process 的 input
- `grep` 可以將 input 作搜尋。而我們用 `grep LISTEN` 來找出有 LISTEN 的行

[^1]: 來自[Find and kill all processes listening on a port](https://til.hashrocket.com/posts/e4c8c665a8-find-and-kill-all-processes-listening-on-a-port)
[^2]: [https://man7.org/linux/man-pages/man8/lsof.8.html](https://man7.org/linux/man-pages/man8/lsof.8.html)

輸出的結果會像這樣，第二欄就是 process ID，就可以用 `kill 2741` 把 3000 PORT 的 node 服務關掉

```
process_1  624 user    3u     IPv4 0x8af490fdacaaa50b        0t0                 TCP 127.0.0.1:44950 (LISTEN)
process_1  624 user    4u     IPv4 0x8af490fdacaacf4b        0t0                 TCP 127.0.0.1:44960 (LISTEN)
process_1  624 user   11u     IPv4 0x8af490fdacaa9a7b        0t0                 TCP 127.0.0.1:18412 (LISTEN)
process_1  624 user   39u     IPv4 0x8af490fdacaa650b        0t0                 TCP 127.0.0.1:7335 (LISTEN)
node      2741 user   26u     IPv4 0x8af490fdaca8fa2b        0t0                 TCP 127.0.0.1:hbci (LISTEN)
process_3 4349 user   14u     IPv4 0x8af490fdaca75a7b        0t0                 TCP 127.0.0.1:10400 (LISTEN)

```

:::info
在上面並沒有 3000 PORT 的 process，不過有一個 `127.0.0.1:hbci`，`hbci` 代表 Home Banking Computer Interface，因為 3000 PORT 是 [`hbci` 服務已註冊的 PORT](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=3000)，所以 `lsof` 會自動幫你轉換成可識別的服務代稱[^3]。
:::

[^3]: 可以參考這個回答 [TCP \*:hbci (LISTEN) - What does hbci mean?](https://unix.stackexchange.com/questions/346060/tcp-hbci-listen-what-does-hbci-mean)

另外 lsof 可以代參數，例如我們只要找有使用 TCP protocol 的 process 就可以使用

```
lsof -i tcp
```

也可以在後面加上 PORT，這也是文中[^1]提到的用法

```
lsof -i tcp:[PORT]
```

最後則是最方便的方式

```
lsof -ti tcp:[PORT] | xargs kill
```

`-t` 代表著只輸出 processID，`xargs` 這個指令會把 input 以空白分隔，然後把這些放進接著指定的指令的參數[^4]，有點饒口。但看 output 就很清楚，`lsof -ti tcp:3000` 會 output 以下的內容

```
2741
```

而我們把上面的 output pipeline 進去 xargs 之後，因為只有一個數字也沒什麼好分割的。換句話說，也就是執行以下指令：

```
kill 2741
```

換句話說 `lsof -ti tcp:[PORT] | xargs kill` 能夠找出使用對應的 PORT 的 process，然後直接關閉。

[^4]: 參考自：[Linux 系統 xargs 指令範例與教學](https://blog.gtwang.org/linux/xargs-command-examples-in-linux-unix/)
