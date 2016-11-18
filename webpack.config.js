'use strict'

var path = require('path')
var webpack = require('webpack')

var env = process.env.NODE_ENV || 'development'

var definePlugin = new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify(env)
  }
})
var dedupePlugin = new webpack.optimize.DedupePlugin()
var uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false,
    properties: true,
    sequences: true,
    dead_code: true,
    conditionals: true,
    comparisons: true,
    evaluate: true,
    booleans: true,
    unused: true,
    loops: true,
    hoist_funs: true,
    cascade: true,
    if_return: true,
    join_vars: true,
    drop_debugger: true,
    unsafe: true,
    hoist_vars: true,
    negate_iife: true
  },
  sourceMap: Boolean(process.env.SOURCE_MAP),
  mangle: {
    toplevel: false,
    sort: true,
    eval: true,
    properties: false
  },
  output: {
    space_colon: false,
    comments: false
  }
})

var config = module.exports = {
  context: __dirname,
  entry: {
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    sourceMapFilename: '[name].map',
    path: path.resolve('./dist')
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        // include: path.resolve('./src/javascripts'),
        // loader: require.resolve('babel-loader'),
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json']
  },

  plugins: [
    definePlugin
  ],

  externals: {
    'tracker': 'tracker'
  },

  recordsPath: path.resolve('/tmp/webpack.json')
}

config.entry[process.env.npm_package_name] = path.resolve(process.env.npm_package_main)

if (process.env.NODE_ENV === 'production') {
  if (process.env.SOURCE_MAP) {
    config.devtool = 'source-map'
  }

  config.output.publicPath = '/dist/'
  config.output.pathinfo = true

  var COMMIT_SUFFIX = process.env.COMMIT_HASH || ''
  if (COMMIT_SUFFIX) {
    config.output.filename = `[name].${COMMIT_SUFFIX}.js`
    config.output.chunkFilename = `[name].${COMMIT_SUFFIX}.js`
    config.output.sourceMapFilename = `[name].${COMMIT_SUFFIX}.map`
  } else {
    config.output.filename = '[chunkhash].[name].js'
    config.output.chunkFilename = '[chunkhash].[name].js'
    config.output.sourceMapFilename = '[chunkhash].[name].map'
  }

  config.plugins.unshift(dedupePlugin, uglifyPlugin)
}
