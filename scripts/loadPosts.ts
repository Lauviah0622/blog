import * as fs from 'fs'
import { program } from 'commander'
import * as fm from 'front-matter'

// why the fuck fm cannot been call??????????

program.option('-f, --from <path>', 'import path')
program.parse()

const { from } = program.opts()

console.log('__dirname', __dirname)
console.log('process.cwd', process.cwd())

function loadPath(path) {
  const stats = fs.statSync(path)
  if (stats.isDirectory()) {
    const files = fs
      .readdirSync(path, { encoding: 'utf-8' })
      .map((name) => {
        const prefix = path.replace(/\.\//, '')
        const pathInDir = `${process.cwd()}/${prefix}${
          prefix ? '/' : ''
        }${name}`
        const stat = fs.statSync(pathInDir)
        return {
          path: pathInDir,
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

function frontMatterCheck(text) {
  const content = fm<{ name: string }>(text)
  /**
   * fucking typescript issue 
   * This expression is not callable.
   * Type 'typeof import("/Users/lavi/Code/program/blog/node_modules/.pnpm/front-matter@4.0.2/node_modules/front-matter/index")' has no call signatures.ts(2349)
   */
}

;(function () {
  const files = loadPath(from)
  files?.map((file) => {
    // console.log(f)

    frontMatterCheck(file.content)

    return file
  })
})()
