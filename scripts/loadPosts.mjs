import * as fs from 'fs'
import { Command } from 'commander'
import fm from 'front-matter'
import yaml from 'js-yaml'
import * as path from 'path'
import gradient from 'gradient-string'
import Table from 'cli-table3'
// const fs = require('fs')
// const { program } = require('commander')
// const fm = require('front-matter')

const LAYOUT = '/src/layouts/Post.astro'
const IMAGE_FOLDER = './public/assets/images/post/'
const POST_FOLDER = './src/pages/post'
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
]
// const POST_FOLDER = './test/dist/'

const printSafe = (text) => console.log(gradient.mind(text))
const printError = (text) => console.log(gradient.fruit(text))

const program = new Command()

program.command('posts <source>').action((source) => {
  printSafe(`loading... ${source}`)
  const files = loadPath(source)
  // printMind(files)
  printSafe(`create Md model...`)
  const markdowns = markdownsConstructor(files)

  // printMind('prev: ', markdowns)

  check(markdowns)

  printSafe(`copy image start`)
  copyImage(markdowns)
  printSafe(`copy image done`)
  printSafe(`copy post start`)
  copyPost(markdowns)
  printSafe(`copy post done`)
})

program.command('tips <source>').action((source) => {
  // console.log(source)
})

program.command('collect <source>').action((source) => {
  console.log(source)
})

program.parse()

function printTable(data) {
  const head = HEAD
  const table = new Table({
    head,
    // colWidths: Arra
  })
  data.forEach((check) => {
    const row = []
    head.forEach((col) => {
      const val = check[col]
      row.push(val)
    })
    table.push(row)
  })
  console.log(table.toString())
}

function check(markdowns) {
  const data = markdowns.reduce((prev, md) => {
    const check = markdownCheck(md)
    prev.push(check)

    md.willImport = check.willImport
    return prev
  }, [])

  printTable(data)
}

function copyPost(markdowns) {
  markdowns.forEach((mk) => {
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
    const dist = path.normalize(`${POST_FOLDER}/${fileName}`)
    fs.writeFileSync(dist, post, { encoding: 'utf-8' })
  })
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
      md.frontmatter.attributes.cover = toRelativePath(dist)
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

        image.dist = toRelativePath(dist)
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

function relativeToAbsPath(fileName, relativePath = './') {
  const dir = relativePath.replace(/\.\//, '')

  return path.normalize(`${process.cwd()}/${dir}${dir ? '/' : ''}${fileName}`)
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
    const filename = path.basename(filepath)
    return [
      {
        path: filepath,
        content,
        filename,
      },
    ]
  }

  return []
}

function markdownCheck(md) {
  const frontmatter = md.frontmatter

  const title = !!frontmatter.attributes?.title
  const hasFrontmatter = !!frontmatter?.frontmatter
  const pubDate = !!frontmatter.attributes?.pubDate
  const draft = !!frontmatter.attributes?.draft
  const willImport = frontmatter && title && pubDate && !draft
  const cover = !!frontmatter.attributes?.cover

  // const images = [...md.images]
  // if (cover) {
  //   images.push({
  //     source: frontmatter.attributes.cover,
  //   })
  // }
  // const isLocalImagesLost = checkIsLocalImageLost(images)

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

function toRelativePath(path) {
  return `./${path}`
  return path
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
      const bodyImages = Array.from(bodyImagesMatchesIter)
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

      const nextFile = { ...file }

      if (bodyImages.length !== 0) {
        nextFile.images = bodyImages
      }

      return nextFile
    })
  return markdowns
}

/*

const check = frontMatterCheck(frontmatter)
 */

/*
產生 absSource 的

.map((image) => {
          const nextImage = {...image}
          const isLocal = isLocalPath(nextImage.source)
          
          if (isLocal) {
            nextImage.absSource = relativeToAbsPath(nextImage.source, )
          }
          return nextImage
        })
*/
