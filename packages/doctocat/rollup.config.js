import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import esbuild from 'rollup-plugin-esbuild'
import path from 'node:path'
import {createHash} from 'node:crypto'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'

export default [
  {
    input: ['./src/index.ts'],
    external: ['react'],
    plugins: [
      nodeResolve({
        include: /node_modules/,
      }),
      commonjs({
        include: /node_modules/,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
      }),
      esbuild(),
      preserveCSS(),
    ],
    output: {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  },
]

function preserveCSS() {
  return {
    name: 'preserve-css-in-bundle',

    resolveId(source, importer) {
      if (source.endsWith('.css') && !source.endsWith('.module.css')) {
        return {
          id: path.resolve(path.dirname(importer), source),
          external: true,
        }
      }
    },

    async transform(code, id) {
      if (!id.endsWith('.css')) {
        return
      }

      let classes = null
      const result = await postcss([
        postcssModules({
          getJSON(_filename, json) {
            classes = json
          },
        }),
      ]).process(code, {from: id})
      const source = result.css
      const hash = getSourceHash(source)
      const relativePath = path.relative(path.join(process.cwd(), 'src'), id)

      const fileName = path.join(
        path.dirname(relativePath),
        path.format({
          name: path.basename(relativePath, '.module.css') + `-${hash}`,
          ext: '.css',
        }),
      )

      this.emitFile({
        type: 'asset',
        source,
        fileName,
      })

      return {
        code: `
          import './${path.basename(fileName)}';
          export default ${JSON.stringify(classes)};
        `,
      }
    },
  }
}

const DEFAULT_HASH_SIZE = 8

function getSourceHash(source) {
  return createHash('sha256')
    .update(source)
    .digest('hex')
    .slice(0, DEFAULT_HASH_SIZE)
}
