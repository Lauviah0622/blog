import * as fs from 'fs'
import { Command } from 'commander'
import fm from 'front-matter'
import yaml from 'js-yaml'
import * as path from 'path'
// const fs = require('fs')
// const { program } = require('commander')
// const fm = require('front-matter')

const LAYOUT = '/src/layouts/Post.astro'
const IMAGE_FOLDER = './public/assets/images/post/'
const POST_FOLDER = './src/pages/post'
// const POST_FOLDER = './test/dist/'

const program = new Command()

program.command('posts <source>').action((source) => {
  const files = loadPath(source)
  // console.log(files)
  const markdowns = markdownsConstructor(files)

  // console.log('prev: ', markdowns)
  copyImage(markdowns)
  // console.log('next: ', markdowns)
  copyPost(markdowns)
})

program.command('tips <source>').action((source) => {
  // console.log(source)
})

program.command('collect <source>').action((source) => {
  console.log(source)
})

program.parse()

const { from } = program.opts()

function copyPost(markdowns) {
  markdowns.forEach((mk) => {
    console.log(mk)
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
  markdowns.forEach((mk) => {
    const coverSource = mk.frontmatter.attributes?.cover ?? ''
    const mdDir = path.dirname(mk.path)
    const mkAbsPath = path.resolve(mk.path)
    const mkAbsDir = path.dirname(mkAbsPath)

    if (coverSource.length > 0 && isLocalPath(coverSource)) {
      const source = path.normalize(`${mkAbsDir}/${coverSource}`)
      const fileName = path.basename(coverSource)

      const dist = path.normalize(`${IMAGE_FOLDER}/${fileName}`)
      // relativeToAbsPath(fileName, IMAGE_FOLDER)

      console.log('cover dist', IMAGE_FOLDER, fileName, dist)
      fs.copyFileSync(source, dist)

      // replace cover Source
      mk.frontmatter.attributes.cover = toRelativePath(dist)
    }

    if (mk.images) {
      for (const image of mk.images) {
        const source = image.source
        if (!isLocalPath(source)) {
          continue
        }
        const imageSource = path.normalize(`${mkAbsDir}/${source}`)

        const imageFileName = path.basename(source)
        const dist = path.normalize(`${IMAGE_FOLDER}/${imageFileName}`)
        fs.copyFileSync(imageSource, dist)

        image.dist = toRelativePath(dist)

        // console.log('dist', source, dist)
        mk.frontmatter.body = mk.frontmatter.body.replace(source, image.dist)
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

function loadPath(path) {
  const stats = fs.statSync(path)
  if (stats.isDirectory()) {
    const files = fs
      .readdirSync(path, { encoding: 'utf-8' })
      .map((name) => {
        const absPath = relativeToAbsPath(name, path)
        const stat = fs.statSync(absPath)
        return {
          path: absPath,
          isDirectory: stat.isDirectory(),
        }
      })
      .filter(({ isDirectory }) => !isDirectory)
      .map(({ path }) => {
        const content = fs.readFileSync(path, 'utf-8')
        return { path, content }
      })
    return files
  } else if (stats.isFile()) {
    const content = fs.readFileSync(path, 'utf-8')
    return [
      {
        path,
        content,
      },
    ]
  }

  return []
}

function frontMatterCheck(frontmatter) {
  const check = {
    hasFrontMatter: !!frontmatter?.frontmatter,
    hasTitle: !!frontmatter.attributes?.title,
    hasPubDate: !!frontmatter.attributes?.pubDate,
    hasSummary: !!frontmatter.attributes?.summary,
    hasCover: !!frontmatter.attributes?.cover,
    hasTags:
      !!frontmatter.attributes?.tags &&
      frontmatter.attributes?.tags.length !== 0,
    hasLayout: !!frontmatter.attributes?.layout,
    isDraft: !!frontmatter.attributes?.draft,
  }
  return check
}

function isLocalPath(str) {
  return !str.match(/^https?:\/\//g)
}

function getFileNameFromPath(path) {
  const [_, fileName] = path.match(/.*\/(.*?\..*)/)

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
