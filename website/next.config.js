import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

/**
 * @type {import('next').NextConfig}
 */
let config = {
  output: 'export',
  webpack(config, options) {
    if (process.env.ANALYZE_BUNDLE_SIZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'json',
          openAnalyzer: process.env.CI ? false : true,
          generateStatsFile: true,
          statsFilename: `./analyze/stats.json`,
          reportFilename: !options.nextRuntime
            ? `./analyze/client.html`
            : `../${options.nextRuntime === 'nodejs' ? '../' : ''}analyze/${
                options.nextRuntime
              }.html`,
        }),
      )
    }

    return config
  },
}

export default config
