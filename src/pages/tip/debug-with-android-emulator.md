---
title: 如何在使用 Android emulator Debug mobile website
pubDate: 2024-12-30T00:00:00.000Z
tags:
  - android
  - debug
layout: /src/layouts/Post.astro

---

## 大方向
- 安裝 emulator
- 建立虛擬機
- 設定虛擬機：類似開發設定，讓 emulator 內部也可以連線到本地機 & 開發機
  - 設定 certificate
  - 設定 hosts：主要是要連到 localhost
- 透過 chrome 和 emulator 的 chrome 連線 debug

## 步驟
####  安裝 emultaor

```bash
brew install --cask android-studio
```

ref: [android-studio — Homebrew Formulae](https://formulae.brew.sh/cask/android-studio) 


#### 建立虛擬機

1. 打開 device manager

![](/public/assets/images/post/20241230_debug-with-android-emulator-01.jpg)


2. 新增 virtual device

![](/public/assets/images/post/20241230_debug-with-android-emulator-02.jpg)


3. select hardware
要注意要選沒有 playstore 的 hardware 才能透過 adb 設定 hosts(後續步驟設定)

![](/public/assets/images/post/20241230_debug-with-android-emulator-03.jpg)


4. 選擇 image 
第一次選擇會需要下載，要點擊名稱旁邊的下載 icon

![](/public/assets/images/post/20241230_debug-with-android-emulator-04.jpg)


5. 設定名稱還有其他參數

![](/public/assets/images/post/20241230_debug-with-android-emulator-05.jpg)


#### 開啟虛擬機

- 不要用 android-studio，而使用 cli 直接開 emulator
- 找到安裝位置的 exe 檔並開啟：如果用 brew 下載的話，path 應該會是 `~/Library/Android/sdk/emulator/emulator`

參考文件文件：[Start the emulator from the command line  |  Android Studio  |  Android Developers](https://developer.android.com/studio/run/emulator-commandline)

指令

```
emultaor -list-avds //列出所有 emultaor
emulator -avd {{device name}} // 開啟目標的虛擬機
```
	
#### 設定憑證

如果有使用憑證進行客戶端 ssl 驗證的，需要進行此步驟，沒有的可以跳過

- 直接把 cert 檔案拖曳進 emulator
- 到 android 的 file explorer 裡面可以看到剛剛拉進去的 cert 檔案
- 有密碼的話輸入密碼
- 點擊 vpn ....... 第一個選項


![](/public/assets/images/post/20241230_debug-with-android-emulator-06.jpg)
![](/public/assets/images/post/20241230_debug-with-android-emulator-07.jpg)
![](/public/assets/images/post/20241230_debug-with-android-emulator-08.jpg)

#### 設定 host
目標：設定 emulator OS 裡面的 HOST 檔案，讓 domain 可以指向到 localhost

參考文件：[How to edit /etc/hosts file in Android Studio emulator running in nougat? - Stack Overflow](https://stackoverflow.com/questions/41117715/how-to-edit-etc-hosts-file-in-android-studio-emulator-running-in-nougat)


Steps
- 打開虛擬機，` emulator -avd Pixel_6_Pro_-_for_web -writable-system`
	- 要注意設定的虛擬機不能有 applestore 功能
	- 要注意必須要 `-writable-system` 的參數，後續才能進行 root
- 下載 adb [android - Installing ADB on macOS - Stack Overflow](https://stackoverflow.com/questions/31374085/installing-adb-on-macos)
	- `brew install android-platform-tools`

然後執行

```bash
./adb root
./adb remount
./adb shell // 用 cli 控制 emulator
```

如果遇到以下 error
```bash
adb: unable to connect for root: device offline
```
可以重跑 adb
```
adb kill-server
adb start-server
```

- 編輯 OS 的 host 設定，步驟可以上網自己找
- 但是在 emulator 裡面，localhost 的 ip 是  `10.0.2.2`

```bash
127.0.0.1       localhost
::1             ip6-localhost
10.0.2.2 local.dev.com
~
```


- 透過 chrome 和 emulator 裡面的 chrome 連線 debug，參考文件： [css - Using Google Chrome Dev tools on Android (emulator) - Stack Overflow](https://stackoverflow.com/questions/29305353/using-google-chrome-dev-tools-on-android-emulator)


- url: `chrome://inspect/#devices`
- 看到目標裝置之後點擊 inspect



