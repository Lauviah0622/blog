---
title: 稍微看看 SQL injection 原理
pubDate: 2020-04-24T00:00:00.000Z
tags:
  - security
layout: /src/layouts/Post.astro

---
如果有人在 server 裡面用這麼樣的一段 code 去驗證登入正不正確
ex：
```php
var username = $_POST['username'];
var password = $_POST['password']
var sql = `SELECT * FROM users WHERE users.username = "${username}" AND password = "${password}"`;

if (SQLquery(sql).result.length > 0) {
    signIn()
};
```

基本上就是用這段 ：`SELECT * FROM users WHERE username = "${username}" AND password = "${password}"` ，然後填入 usernae 跟 password 之後做 SQL query，最後檢查說這個有沒有符合的 row 來驗證有沒有符合的使用者。一切的一切都很正常，直到有一天有個壞傢伙在帳號打了這個東西。
```
username : "OR 1=1 #
password : whatever(實際上是什麼不重要)
```

打了這個之後我們來看看 query 的語法會變甚麼款
```
SELECT * FROM users WHERE username = ""OR 1=1 #" AND password = "whatever"
``` 
在 SQL 裡面， `#` 後面的東西都會被註解，所以我們的 SQL 語法變成了這樣

```
SELECT * FROM users WHERE username = ""OR 1=1
``` 

上面這段語法可以幹嘛？`WHERE username = "" or 1 = 1`，`1 = 1` , `1 = 1` 一定會 return `true` 的，所以會直接抓到全部的資料。駭客： 

> 計画通り

### 所以 SQL injection 是什麼？

> 簡單來說， 就是透過駭客輸入非法的 input，讓你的 query SQL 語句產生設計以外的作用，來竊取資料的方法。

### 要怎麼防範

Parameterized statement 參數化查詢，原本這個方法是儲存語法以及需要搜索的路徑，來應對重複但不同關鍵字的的搜索，就不用重複的解析 SQL 語法以及重複搜尋路徑。因為搜尋的語句已經被固定了只會放入參數，所以剛好可以防範 SQL injection 攻擊，可喜可賀！