require("babel-polyfill");
var path = require('path');
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    './src/entry.js',
    // 'webpack-dev-server/client?http://localhost:8080', NOTE: Uncomment these two lines for Webpack Dev Server use
    // 'webpack/hot/dev-server',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'application.js',
    publicPath: '/',
  },
  devTool: 'source-map',
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
        test: /\.scss$/,
        include: /src\/scss/,
        loader: "style!css?sourceMap!postcss!sass?sourceMap!"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loaders: [
          'babel?presets[]=es2015,presets[]=stage-0'
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      },
    ],
  },
  postcss: function(webpack) {
    return [
      autoprefixer({ browsers: ["last 2 versions"]})
    ];
  },
  resolve: {
    extensions: ['', '.js', '.css', '.scss'],
    modulesDirectories: ['src', 'node_modules'],
  }
}