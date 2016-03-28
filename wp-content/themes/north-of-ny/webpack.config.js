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
        test: /\.jsx?$/,
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
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'react-hot',
          'babel?presets[]=react,presets[]=es2015'
        ],
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
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