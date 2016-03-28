var autoprefixer = require('autoprefixer');
var variables    = require('postcss-simple-vars');
var nested       = require('postcss-nested');
var importer     = require('postcss-import');

module.exports = {
  entry: './src/entry.js',
  output: {
    publicPath: '/build',
    filename: 'bundle.js',
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
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
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'babel?presets[]=react,presets[]=es2015'
        ],
      },
    ],
  },
  postcss: function(webpack) {
    return [
      autoprefixer({ browsers: ["last 2 versions"]}),
      nested,
      variables,
      importer({addDependencyTo: webpack})];
  },
  resolve: {
    extensions: ['', '.js', '.css'],
    modulesDirectories: ['src', 'node_modules'],
  }
}