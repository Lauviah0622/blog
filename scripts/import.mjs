import * as fs from 'fs'
import { Command } from 'commander'
import fm from 'front-matter'
import 'dotenv/config'
import yaml from 'js-yaml'
import * as path from 'path'
import gradient from 'gradient-string'
import Table from 'cli-table3'
import dayjs from 'dayjs'
// const fs = require('fs')
// const { program } = require('commander')
// const fm = require('front-matter')

const POST_LAYOUT = '/src/layouts/Post.astro'
const COLLECTION_LAYOUT = '/src/layouts/Collection.astro'
const IMAGE_FOLDER = './public/assets/images/post/'
const POST_FOLDER = './src/pages/post'
const TIP_FOLDER = './src/pages/tip'
const COLLECTION_FILE = './src/pages/collection.md'
const HEAD = [
  'filename',
  'willImport',
  'frontmatter',
  'title',
  'pubDate',
  'summary',
  'cover',
  'tags',
  'layout',
  'draft',
  'image',
]

const IMAGE = ['no image', 'pass', 'missing']
const POSTS_SOURCE = process.env.POSTS_SOURCE
const TIPS_SOURCE = process.env.TIPS_SOURCE
const COLLECTION_SOURCE = process.env.COLLECTION_SOURCE
// const POST_FOLDER = './test/dist/'

const printSafe = (text) => console.log(gradient.mind(text))
const printError = (text) => console.log(gradient.fruit(text))

const program = new Command()

program.command('posts').action(() => {
  printSafe(`loading posts from ${POSTS_SOURCE}... `)
  const files = loadPath(POSTS_SOURCE)
  printSafe(`create Md model...`)
  const markdowns = markdownsConstructor(files)

  printSafe('prev: ', files)

  check(markdowns, postCheck)

  printSafe(`copy image start`)
  copyImage(markdowns)
  printSafe(`copy image done`)
  printSafe(`copy post start`)
  clonePost(markdowns, POST_LAYOUT, POST_FOLDER)
  printSafe(`copy post done`)
})

program.command('tips').action(() => {
  printSafe(`loading tips from ${TIPS_SOURCE}...`)
  const files = loadPath(TIPS_SOURCE)
  printSafe(`create Md model...`)
  const markdowns = markdownsConstructor(files)

  check(markdowns, postCheck)

  printSafe(`copy image start`)
  copyImage(markdowns)
  printSafe(`copy image done`)
  printSafe(`copy post start`)
  clonePost(markdowns, POST_LAYOUT, TIP_FOLDER)
  printSafe(`copy post done`)
})

program.command('collection').action(() => {
  printSafe(`loading tips from ${COLLECTION_SOURCE}...`)
  const file = loadPath(COLLECTION_SOURCE)
  const markdowns = markdownsConstructor([file])
  check(markdowns, collectionCheck)

  printSafe(`copy image start`)
  copyImage(markdowns)
  printSafe(`copy image done`)
  printSafe(`copy post start`)
  const [markdown] = markdowns
  console.log(markdown)
  clonePost(markdown, COLLECTION_LAYOUT, COLLECTION_FILE)
  printSafe(`copy post done`)
  // console.log({ markdown })
})

program.parse()

function printTable(data) {
  const columns = data.reduce((columns, datum) => {
    Object.keys(datum).forEach((key) => {
      columns.add(key)
    })
    return columns
  }, new Set())
  const head = [...columns]
  const table = new Table({
    head,
    // colWidths: Arra
  })
  data.forEach((check) => {
    const row = []
    head.forEach((col) => {
      const val = check[col]

      let log
      switch (col) {
        case 'image':
          log = IMAGE[val]
          break

        default:
          log = val
          break
      }
      row.push(log)
    })
    table.push(row)
  })
  console.log(table.toString())
}

function check(markdowns, checkFunc) {
  const data = markdowns.reduce((prev, md) => {
    const check = checkFunc(md)
    prev.push(check)

    md.willImport = check.willImport
    return prev
  }, [])

  printTable(data)
}

function clonePost(markdown, layout, distDir) {
  if (Array.isArray(markdown)) {
    // multi files
    markdown
      .filter(({ willImport }) => willImport)
      .map((mk) => {
        // TODO 這個東西要抽出來，放到 patch 階段去處理
        mk.frontmatter.attributes['layout'] = layout
        return mk
      })
      .forEach((mk) => {
        if (!mk.willImport) return
        const frontMatterText = yaml.dump(mk.frontmatter.attributes, {
          styles: {
            '!!timestamp': 'YYYY-MM-DD',
          },
        })

        const body = mk.frontmatter.body

        const post = `---
${frontMatterText}
---
${body}`

        const fileName = path.basename(mk.path)
        const dist = path.normalize(`${distDir}/${fileName}`)
        fs.writeFileSync(dist, post, { encoding: 'utf-8' })
      })
  } else {
    // currently onlt collection use
    const mk = { ...markdown }
    if (!markdown.willImport) return
    // TODO 這個東西要抽出來，放到 patch 階段去處理
    mk.frontmatter.attributes['layout'] = layout
    mk.frontmatter.attributes['updateData'] = dayjs().format('YYYY.MM.DD')
    const frontMatter = yaml.dump(mk.frontmatter.attributes, {
      styles: {
        '!!timestamp': 'YYYY-MM-DD',
      },
    })
    const body = mk.frontmatter.body
    const post = `---
${frontMatter}
---
${body}`
    const dist = distDir

    console.log('123123', { dist, post })
    fs.writeFileSync(dist, post, { encoding: 'utf-8' })
  }
}

function copyImage(markdowns) {
  const copy = (source) => {}
  markdowns.forEach((md) => {
    const coverSource = md.frontmatter.attributes?.cover ?? ''
    const mdDir = path.dirname(md.path)
    const mkAbsPath = path.resolve(md.path)
    const mkAbsDir = path.dirname(mkAbsPath)

    if (coverSource.length > 0 && isLocalPath(coverSource)) {
      const source = path.normalize(`${mkAbsDir}/${coverSource}`)
      const fileName = path.basename(coverSource)

      const dist = path.normalize(`${IMAGE_FOLDER}/${fileName}`)
      fs.copyFileSync(source, dist)
      md.frontmatter.attributes.cover = `/${removePublic(dist)}`
    }

    if (md.images) {
      for (const image of md.images) {
        const source = image.source
        if (!isLocalPath(source)) {
          continue
        }
        const imageSource = path.normalize(`${mkAbsDir}/${source}`)

        const imageFileName = path.basename(source)
        const dist = path.normalize(`${IMAGE_FOLDER}/${imageFileName}`)
        try {
          fs.copyFileSync(imageSource, dist)
        } catch (err) {
          if (err.code === 'ENOENT' && err.syscall === 'copyfile') {
            printError(`
local image does not exist: 
file name: ${source}
at ${md.path}
`)
          }
        }

        image.dist = `/${removePublic(dist)}`
        md.frontmatter.body = md.frontmatter.body.replace(source, image.dist)
      }
    }
  })
}

function addLayout(markdowns) {
  for (const markdown of markdowns) {
    if (markdown.frontmatter.attributes?.layout) {
      markdown.frontmatter.attributes.layout = LAYOUT
    }
  }
}

function relativeToAbsPath(filename, relativePath = './') {
  return path.resolve(`${relativePath}/${filename}`)
}

function loadPath(loadedPath) {
  const stats = fs.statSync(loadedPath)
  if (stats.isDirectory()) {
    const files = fs
      .readdirSync(loadedPath, { encoding: 'utf-8' })
      .map((name) => {
        const absPath = relativeToAbsPath(name, loadedPath)

        const stat = fs.statSync(absPath)
        return {
          path: absPath,
          isDirectory: stat.isDirectory(),
        }
      })
      .filter(({ isDirectory }) => !isDirectory)
      .map(({ path: filePath }) => {
        const content = fs.readFileSync(filePath, 'utf-8')
        const filename = path.basename(filePath)
        return { path: filePath, content, filename }
      })
    return files
  } else if (stats.isFile()) {
    const content = fs.readFileSync(loadedPath, 'utf-8')
    const filename = path.basename(loadedPath)
    return {
      path: loadedPath,
      content,
      filename,
    }
  }

  return []
}

function collectionCheck(md) {
  const frontmatter = md.frontmatter

  const hasFrontmatter = !!frontmatter?.frontmatter
  const pubDate = !!frontmatter.attributes?.pubDate
  const willImport = hasFrontmatter && !!pubDate

  const imagesExist = md.images
    .filter(({ source }) => isLocalPath(source))
    .map(({ source }) => {
      const mkAbsPath = path.resolve(md.path)
      const mkAbsDir = path.dirname(mkAbsPath)
      const imagePath = path.resolve(`${mkAbsDir}/${source}`)

      return { exist: fs.existsSync(imagePath), source }
    })

  const isImagesExist = imagesExist.every(({ exist }) => exist)
  const image = md.images.length === 0 ? 0 : isImagesExist ? 1 : 2

  const check = {
    filename: md.filename,
    frontmatter: hasFrontmatter,
    pubDate,
    layout: !!frontmatter.attributes?.layout,
    willImport,
    image,
  }
  return check
}

function postCheck(md) {
  const frontmatter = md.frontmatter

  const title = !!frontmatter.attributes?.title
  const hasFrontmatter = !!frontmatter?.frontmatter
  const pubDate = !!frontmatter.attributes?.pubDate
  const draft = !!frontmatter.attributes?.draft
  const willImport = frontmatter && title && pubDate && !draft
  const cover = !!frontmatter.attributes?.cover

  const imagesExist = md.images
    .filter(({ source }) => isLocalPath(source))
    .map(({ source }) => {
      const mkAbsPath = path.resolve(md.path)
      const mkAbsDir = path.dirname(mkAbsPath)
      const imagePath = path.resolve(`${mkAbsDir}/${source}`)

      return { exist: fs.existsSync(imagePath), source }
    })

  const isImagesExist = imagesExist.every(({ exist }) => exist)
  // const images = [...md.images]
  const image = md.images.length === 0 ? 0 : isImagesExist ? 1 : 2

  const check = {
    filename: md.filename,
    frontmatter: hasFrontmatter,
    title,
    pubDate,
    summary: !!frontmatter.attributes?.summary,
    cover,
    tags:
      !!frontmatter.attributes?.tags &&
      frontmatter.attributes?.tags.length !== 0,
    layout: !!frontmatter.attributes?.layout,
    draft,
    willImport,
    image,
  }
  return check
}

function checkIsLocalImageLost(images) {
  // images.forEach(() => {
  //   const mdDir = path.dirname(md.path)
  //   const mkAbsPath = path.resolve(md.path)
  //   const mkAbsDir = path.dirname(mkAbsPath)
  // })
}

function isLocalPath(str) {
  return !str.match(/^https?:\/\//g)
}

function getFileNameFromPath(filePath) {
  const [_, fileName] = filePath.match(/.*\/(.*?\..*)/)

  return fileName
}

function removePublic(path) {
  return path.replace('public/', '')
}

function toRelativePath(path) {
  return `./${path}`
}

function markdownsConstructor(files) {
  const markdowns = files
    ?.map((file) => {
      const frontmatter = fm(file.content)

      return { ...file, frontmatter }
    })
    .map((file) => {
      const bodyImagesMatchesIter = file.frontmatter.body.matchAll(
        /!\[(.*?)\]\((.*?)(\s?'(.*?)')?\)/gm
      )
      const images = Array.from(bodyImagesMatchesIter)
        .map((match) => {
          const [raw, alt, source, _, title] = match
          return {
            raw,
            alt,
            source,
            title,
          }
        })
        .filter(({ source }) => !!source)

      return {
        ...file,
        images,
      }
    })
  return markdowns
}
