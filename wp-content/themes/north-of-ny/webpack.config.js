require("babel-polyfill");
var path = require('path');
var autoprefixer = require('autoprefixer');
var variables    = require('postcss-simple-vars');
var nested       = require('postcss-nested');
var importer     = require('postcss-import');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/dev-server',
    './src/entry.js',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'dist/application.js',
    publicPath: '/',
  },
  devTool: 'eval',
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'source-map',
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        include: /src\/css/,
        loader: "style-loader!css-loader!postcss-loader!"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loaders: [
          'babel?presets[]=es2015,presets[]=stage-0'
        ],
      },
    ],
  },
  postcss: function(webpack) {
    return [
      autoprefixer({ browsers: ["last 2 versions"]}),
      nested,
      variables,
      importer({addDependencyTo: webpack})
    ];
  },
  resolve: {
    extensions: ['', '.js', '.css'],
    modulesDirectories: ['src', 'node_modules'],
  }
}