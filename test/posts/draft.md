---
draft: true
---

### monorepo 要做到的是

- [ ] package 的管理
- [ ] git 的版本處理
- [ ] CI/CD

## TL;DR

這篇文章主要是紀錄如何設定 monorepo 以及在其中使用相關的 tech stack，可能還會加上一點點的觀念，不過以下的內容不會提到，內容也不太建議參考。
- 與 monorepo 無關的工具自身 config 設定
- tech stack 的優缺點

然後這篇文章很大一部分參考：https://www.youtube.com/watch?v=YQLw5kJ1yrQ。

有時間可以直接點開來看。或者是直接點開影片的範例 repo。

## 流程

1. mono repo
    1. workspace
    2. turbo repo
2. config
    3. typescript
    1. prettier
    2. eslint
    3. jest

## monorepo

Monorepo 分兩個部分
- workspace：
- task control 任務管理：

在本文中 workspace 部分用 pnpm 的 workspace 解決，而 task control 部分則是使用 turborepo。

### workspace

首先先處理 workspace。一個 Monorepo 之下可以有多個 workspace。workspace 內部有自己的 package.json 設定，但 workspace 之間又可以互相「引用」。

可以理解為每個 workspace 都是一個 package，就像 github 上面的任何 repo 一樣。所以就像我們平常執行 `npm add <package>` 一樣，workspace 可以把一個 repo 中的另外一個 workspace 作為 package 引用。

> 這並不是比喻而已，而是真的會放進 node_modules 讓專案作使用。引用的方式也同樣使用 `add` 的指令

下面會是這次作為範例的資料夾結構

```
├── apps
│   └── ...
├── packages
│   └── ...
└── package.json
```

可以看到有 apps 和 packages 兩個資料夾。這不是規定，但在使用 monorepo 的時，通常可以分成兩個類型的 workspace。apps 裡面會放需要執行的專案（），而 packages 裡面會放一些共用的設定，或者是共用的 components。

像 ui 就是前台後台都會使用到的



app 會拿來放需要執行的專案，作為範例有 web 和 server 兩個專案
package 則是放一些共用或者是抽出來的設定


#### 設定 workspace 


有兩個部分，第一要在 root level 的 package.json 新增一個 workspace，並放入會放置 repo 的資料夾

```json
{
  "name": "pickle",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

```

再來來建立 `pnpm-workspace.yaml`，作同樣的設定

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

pnpm-workspace.yaml 是 workspace 的設定檔，需要有這個檔案才會啟用 workdsapce 的功能。而 package.json 的設定則是作為沒有使用 pnpm 時的 fallback。

在 packages 中設定的目錄會被視為 workspace，可以作為 package 來讓內部作 import 以及設定獨立的 package.json

> yarn 的 workspace 也有類似的設定檔，但設定方式可能有差異

#### 操作 workspace
設定完之後可以在每個資料夾都進行 `pnpm init -y`，初始化專案資料夾

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

```

在使用 monorepo 需要注意的是，我們會把每一個 `pnpm-workspace.yaml` 中目錄都視為一個 package，這和一個專案一個 repo 的概念很不一樣，有一些 package.json 中的設定過去不太會理會但現在需要注意。

第一個是 name，在 mono repo 中，能夠以整個 monorepo 的單位來執行 npm，也可以 workspace（也就是 package）來進行操作。而如果要指定 workspace 就會用 package.json 的 name 來作指定。

例如要新增 dependencies 在 root level，也就是所有的 workspace 都可以共用或者是只會在 root level 操作的套件。需要使用這個指令

```shell
pnpm add <package-name> -W
```

但如果要在特定 workspace 使用，就要用

```shell
pnpm --filter <workspace-name> add <package-name>
```

例如我要在 apps 下面的 `web` 這個 workspace 下載 react，我就要用

```
pnpm --filter web add react 

```

> 本文所有的範例的指令，如果沒有標記，就是在專案的根資料夾執行 

而這個 --filter 的 option 可以套用在所有 pnpm 的指令上

> hint: 這個 --filter 的 option 可以下在指令的任何位置，下面兩者是同樣效果
> ```
> pnpm --filter <workspace-name> add <package-name>
> pnpm add <package-name> --filter <workspace-name> 
> ```


在初始化完之後，不管哪個 workspace， package.json 會長這樣。我們會需要作修改

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

```

為了方面套件管理工具以及自己辨識，我們會所有 workspace 更改裡面的 name，加上整個專案名稱的前綴

```
- "name": "server",
+ "name": "@test/server",
```

到這邊就設定好 workspace 了

#### turborepo

turborepo 可以把他視為執行 monorepo scrips 的工具，不過官網的描述也透露他可以作更多的事情

> Turborepo is a high-performance build system for JavaScript and TypeScript codebases.

turbo repo 有兩個強大的地方，其中一點是能夠更方便的執行 scripts。

在使用 monorepo 時，不同的 workspace 中的指令或者是不同的 workspace 之間可能會互相依賴。例如在執行前端專案的 deploy 時，可能需要先執行 ui 的測試，在來是前端的測試，然後再來 build 出前端的檔案，最後才進行 deploy。如果要單純用 npm script 來管理會是很頭痛的事情，turborepo 就可以就用清楚的方式做到這點。下面是官方的範例

```json
//turbo.json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      // A package's `build` task depends on that package's
      // topological dependencies' and devDependencies'
      // `build` tasks  being completed
      // (that's what the `^` symbol signifies).
      "dependsOn": ["^build"]
    },
    "test": {
      // A package's `test` task depends on the `build`
      // task of the same package being completed.
      "dependsOn": ["build"]
    },
    "deploy": {
      // A package's `deploy` task depends on the `build`,
      // `test`, and `lint` tasks of the same package
      // being completed.
      "dependsOn": ["build", "test", "lint"]
    },
    // A package's `lint` task has no dependencies and
    // can be run whenever.
    "lint": {}
  }
}

```

`turbo.json` 是 turborepo 的設定檔，pipe line 可以設定需要執行的指令。

當在 pipeline 裡面設定 `build` 時，我們就可以透過 `turborepo run build` 來執行所有 workspace 中 `package.json` scripts 中設定為 `build` 的指令（超方便），而 `dependsOn` 則是可以設定在執行指令之前要先執行什麼指令。上面的範例中，在執行 deploy 就要先執行 `build`, `test`, 還有 `lint` 的指令。透過設定檔的模式清楚的設定之間的依賴關係。

除此之外，turborepo 有個強大的地方是會幫 build 出來的檔案作 cache，只有有作更動的 workspace 才會真正執行指令。而且不只有 cache，連測試的內容也會一併作 cache。

turbo repo 的設定可以參考：https://turborepo.org/docs/getting-started#add-turborepo-to-your-existing-monorepo，可以直接照著設定。並沒有太複雜就不附上步驟了


---

到這裡基本的 monorepo 的設定就結束了，不過設定完後如何去規劃 monorepo 內部的引用會是下一個問題。

## config

如果每個 workspace 都是相同的 config，可以直接放在 root，像是 `prettier`, `.gitignore`, `husky` 相關設定。

不過如果個別的 workspace 有自己的設定，作法會是把統一把設定寫在其中一個 workspace 中，其他的 workspace 再透過引入的方式引用。像是 `tsconfig`, `jest`, `eslint` 都是這樣的作法。



### prettier

新增 prettier 的設定很簡單，先在根目錄安裝 prettier

```
pnpm add -W prettier
```

然後在根目錄建立 `.prettier.rc`，就可以使用 prettier 了

### typescript 

由於整個專案都會使用 typescript，而且也使用相同的版本，所以我們會在 root 下載，但是卻把設定放特定的 workspace，首先同樣的在根目錄下載 typescript

```
pnpm add -W typescript
```

接下來設定 tsconfig，概念如下

1. 把通用的 tsconfig 放在 packages/tsconfig 這個 workspace 裡面
2. 把 packages/tsconfig 當作一個 package 引用
3. 使用 extends 引用既有的設定，然後在之上新增屬於個別 workspace 的設定，像是 `src`, `excludes`
4. 加上 npm scripts
5. 加上 root level 的 scripts

先建立共用的 rule 在 package/tsconfig 裡面

```json
// packages/tsconfig/base.json

{
    "$schema": "https://json.schemastore.org/tsconfig",
    "compilerOptions": {
      "target": "ES2015",
      "module": "commonjs",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "display": "base"
  }
```

server 使用的 rule

```json
// packages/tsconfig/server.json
{
  "display": "node.js",
  "compilerOptions": {
    "esModuleInterop": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "dist",
    "sourceMap": true,
    "target": "ES6"
  },
}

```

react 使用的 rule，這裡直接把原本 web template 的設定中相同的內容抽到 base.json，剩下的留著就可以。

```json
// packages/tsconfig/react.json
{
    "display": "react.js",
    "extends": "./base.json",
    "compilerOptions": {
      "allowJs": true,
      "allowSyntheticDefaultImports": true,
      "esModuleInterop": false,
      "incremental": true,
      "isolatedModules": true,
      "jsx": "react-jsx",
      "lib": ["dom", "dom.iterable", "esnext"],
      "module": "ESNext",
      "noEmit": true,
      "resolveJsonModule": true,
      "skipLibCheck": false,
      "strict": false,
      "target": "ESNext",
      "useDefineForClassFields": true
    }
  }
  
```

rule 的內容參考就好，每個人習慣不同，自己也沒有完全清楚設定的內容。設定的主要的差別在於不同的環境如 server, react 等。 


通用的設定處理好後，我們在 web 引入 packages/tsconfig 這個 workspace 作為 package

```
pnpm add -D @test/tsconfig --filter @test/web

```

> 我們可以像平常使用套件那樣去使用自己 workspace 的內容，以這樣的方式作新增的 package 在 package.json 中會以 `workspace:` 的方式顯示（僅 pnpm，yarn 或 npm 有不同的方式，但意思相同）
> ```
> "@test/tsconfig": "workspace:^1.0.0",
> ```
> 如果不在乎自己 workspace 的版本，可以改成
> ```
> "@test/tsconfig": "workspace:*",
> ```

然後我們可以在 web 中的 config 改成：

```json
{
  "extends": "@pickle/tsconfig/react.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

而 server, ui 這兩個會用到 TS 的 workspace 可以用相同的方式如法炮製。引用共用的 config，在新增上專屬於 workspace 的 config。

剩下的步驟，因為使用 vite template 的關係，在 package.json 已經有 build 的指令，只要新增到 turborepo 的 setting 就好。

```json
//./turbo.json
{
  "$schema": "https://turborepo.org/schema.json",
  "baseBranch": "origin/main",
  "pipeline": {
+   "build": {
+       "dependsOn": ["^build"],
+       "outputs": ["dist/**"]
    },
  }
}

```
在 `"dependsOn": ["^build"]` 表示會把 workspace 中引用到的套件（包含引用的 workspace）先執行 `build`，再來執行個別的 `build`，outpus 則表示要作 build cache 的資料夾。如果沒有修改到內部的檔案，就不會重新 build。

最後在 root level 加上 build 的指令，就大功告成

```json
"scripts": {
+    "build": "turbo run build"
}
```


### eslint

eslint 的設定概念上 json 很像，只是 eslint 沒有 extends 這個方便的屬性，而且 eslint 會需要引入 package 作使用。

整個引入 eslint 步驟會是這樣

1. 下載 eslint 在 root level
2. 在 config 中下載 eslint 中需要的 package 的 rules
3. 在 config 中編寫通用設定檔
4. 在個別的 workspace 作引入
5. 在個別的 workspace 編寫 config
6. 設定 workspace 層級的 npm scrips
7. 在 root level 使用 turborepo

因為概念很像，除了引入的方式紹稍微不同以外，其他都大同小異

在 root 下載 eslint

```
pnpm add -WD eslint 
```

接下來我們會把需要使用的套件都放在 `packages/config` 這個 workspace 裡面，然後再於個別的 workspace 引入，就可以統一管理 eslint 的 rule package。

可以透過下面的方式新增

```
pnpm add <package-name> --filter @test/config
```

或者是把需要的套件寫入 devDependencies 然後 install
```json
"devDependencies": {
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-react": "7.28.0",
    "@typescript-eslint/eslint-plugin": "^5.7.0",
    "@typescript-eslint/parser": "^5.7.0",
    "eslint-config-airbnb": "^19.0.2",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-config-airbnb-typescript": "^16.1.0",
    "eslint-import-resolver-typescript": "^2.5.0",
    "eslint-plugin-import": "^2.25.3",
    "eslint-plugin-jest": "^25.3.0",
    "eslint-plugin-jest-dom": "^4.0.1",
    "eslint-plugin-testing-library": "^5.0.1"
  }
```

```
pnpm install --filter @test/config
```

只有 eslint 需要下載在 root level 的原因是，eslint 需要在各個 workspace 直接透過 npm script 呼叫。當在 root level 下載 package 時，就相當每個 workspace 都可以存取這個 package。

但用到的 rules 不同，會先存取到在 config 這個 workspace 裡面的 eslint.js 相關設定，然後再讀取位於 config 中的 package，所以可以下載在 config 的 package 就好，這樣看起也比較簡潔清楚。



下載後是編寫通用的設定檔，和 tsconfig 的概念很相似，但不同的是 eslint 沒有好用的 extends 屬性可以用。不過只要能用 JS 編寫就不是什麼大問題，這邊以 react 的通用設定為例，範例裡面有包含 jest 的設定。

```js
// eslint-react.js
module.exports = {
    env: {
      browser: true,
    },
    extends: [
      // 'eslint:recommended',
      'airbnb',
      'airbnb-typescript',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'prettier',
    ],
    plugins: ['@typescript-eslint', 'import'],
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['apps/*/tsconfig.json'],
        },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-shadow": [1]
    },
    overrides: [
      {
        // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching files!
        env: {
          jest: true,
        },
        files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        extends: ['plugin:testing-library/react', 'plugin:jest/recommended'],
        rules: {
          'import/no-extraneous-dependencies': [
            'off',
            { devDependencies: ['**/?(*.)+(spec|test).[jt]s?(x)'] },
          ],
        },
      },
    ],
    ignorePatterns: [
      'node_modules',
      'public',
      'styles',
      'coverage',
      'dist',
      '.turbo',
      '*.svg',
      '*.css'
    ],
}
```

> 因為在設定上和 node 的部分重複的部分不多，所以就不抽出一個 base config

> 注意，因為是要被 node 引入的，避免麻煩直接用 commonJS module。

最後就是在各個 workspace 引入了，一樣以 web 為例，新增 workdspace 作為 dependency。

```
pn add -D @test/config --filter web
```

```js
// apps/web/.eslintrc.js
module.exports = {
    ...require('@test/config/eslint-react.js'),
    parserOptions: {
      root: true,
      tsconfigRootDir: __dirname,
      project: ['./tsconfig.json'],
    },
    ignorePatterns: ['.eslintrc.js', 'jest.config.js']
}
```

要注意的是，使用 TS 需要在這個部分來讀取 workspace 底下的 `tsconfig.json`，包含設定 `tsconfigRootDir` 以及 `ignorePatterns`。這樣 `@typescript-eslint/parser` 才能夠讀取到設定。另外還有 `root` 必須設定為 `true`，來設定根資料夾為自己的 workspace。

最後兩個步驟就是分別在自己的 workspace 以及在 root level 新增 scripts。

```json
// apps/web/package.json

"scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
+   "lint": "eslint --fix --ext .tsx, .ts src/"
}
```

```json
// ./turbo.json
{
    "pipeline": {
    "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**", ".next/**"]
    },
+   "lint": {
+       "outputs": []
+    },  
}

```

```json
// package.json
"scripts": {
     "build": "turbo run build",
+    "lint": "turbo run build"
}
```

---

目前有個問題是，因為在 config 中有使用 

> Warning: React version was set to "detect" in eslint-plugin-react settings, but the "react" package is not installed. Assuming latest React version for linting.

### jest

jest 的設定的概念上就和 eslint 大同小異，就不提太多直接附上步驟。關於 jest 設定部分可以另外找資源去學習，這邊只附上參考影片的設定。


1. 下載需要的 package

```
pnpm add jest -WD
```

```json
// .packages/config/package.json
"devDependencies": {
    "esbuild-jest": "^0.5.0",
    "@testing-library/jest-dom": "^5.16.1",
    "@testing-library/react": "^12.1.2",
    "@testing-library/react-hooks": "^7.0.2",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.4.0",
    "esbuild": "^0.14.10"
}
```
```
pnpm install --filter @test/config
```

2. 建立通用的設定，以 web 為例


```js
// ./packages/config/jest-react-js
module.exports = {
    ...require('./jest-common'),
    resetMocks: true,
    moduleDirectories: ['node_modules'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    collectCoverageFrom: ['**/src/**/*.{js,t,jsx,tsx}'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.tsx?$': 'esbuild-jest',
        '^.+\\.ts?$': 'esbuild-jest',
        '^.+\\.jsx?$': 'esbuild-jest',
        '^.+\\.js?$': 'esbuild-jest'
    },
    coveragePathIgnorePatterns: [],
    coverageThreshold: null

}
```

1. 引入 workspace，新增 workspace 內部設定

```
pnpm add @test/config --filter @test/web
```

```js
// ./apps/web/jest.config.js
module.exports = {
    ...require('config/jest-react'),
    rootDir: '.',
}
```


4. 新增 workspace scripts，以及新增 turborepo 
```json
// apps/web/package.json

"scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint --fix --ext .tsx, .ts src/",
+   "lint": "eslint --fix --ext .tsx, .ts src/"
}
```

```json
// ./turbo.json
{
    "pipeline": {
    "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**", ".next/**"]
    },
    "lint": {    },  
+   "test": {
+        "outputs": ["coverage/**"]
+    },
}

```

```json
// package.json
"scripts": {
     "build": "turbo run build",
     "lint": "turbo run lint",
+    "test": "turbo run test",    
}
```

## tailwind

在設定 tailwind 前需要先理解 tailwind 是什麼。

tailwind 可以說是一組設定好的 css，你可以直接使用 `w-96` 的 class 就可以有對應的 style。而這組 style 的引入需要透過引入包含著設定好的 css。

```cs
// main.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

但很顯然的 `@tailwind` 根本不是正常的 css 語法。所以我們會需要編譯成可被瀏覽器解讀的 css 語法，一個方法是用 tailwind cli，另一個方式則是使用 postCSS。postCSS 可以想成 css 版本的 babel。由於 vite 本身和 postcss 集成的很好，所以我們會採用後者。


整個新增 tailwind 的步驟如下

1. 在 config 下安裝 package

```
pnpm install -D tailwindcss postcss autoprefixer --filter @test/config
```

2. 新增通用設定檔（老梗了）

```js
// ./packages/config/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}

```

```js
// ./packages/config/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

1. 新增 workspace 中的設定檔

```js
// ./apps/web/postcss.config.js
const config = require('config/postcss.config')

module.exports = config
```

```js
// ./apps/web/tailwind.config.js
const config = require('config/tailwind.config')

module.exports = config
```

就這樣大功告成了！！！因為 vite 本身會直接讀取 `postcss.config.js`，來自動對引入的 css 檔案作處理（可以參考 https://cn.vitejs.dev/guide/features.html#postcss）。所以不需要作額外的設定





