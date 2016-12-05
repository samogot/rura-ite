import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';


export default (DEBUG, PATH, PORT = 3000) => ({
  entry: (DEBUG ? [
    `webpack-dev-server/client?http://localhost:${PORT}`,
    'webpack/hot/dev-server'
  ] : []).concat([
    './src/main.styl',
    'babel-polyfill',
    './src/main',
  ]),

  output: {
    path: path.resolve(__dirname, PATH, "generated"),
    filename: DEBUG ? "main.js" : "main-[hash].js",
    publicPath: "/generated/"
  },

  cache: DEBUG,
  debug: DEBUG,

  // For options, see http://webpack.github.io/docs/configuration.html#devtool
  devtool: DEBUG ? "eval" : "source-map",

  devServer: DEBUG ? {hot: true} : undefined,
  module: {
    loaders: [
      // Load ES6/JSX
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, "src"),
        ],
        loader: "babel-loader",
        query: {
          plugins: ['transform-runtime'],
          presets: ['latest', 'stage-0', 'react'],
        }
      },

      // Load styles
      {
        test: /\.styl$/,
        loader: DEBUG
          ? "style!css!autoprefixer!stylus"
          : ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!stylus-loader")
      },
      {
        test: /\.css$/,
        loader: DEBUG
          ? "style!css!autoprefixer"
          : ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")
      },

      // Load images
      {test: /\.jpg/, loader: "url-loader?limit=10000&mimetype=image/jpg"},
      {test: /\.gif/, loader: "url-loader?limit=10000&mimetype=image/gif"},
      {test: /\.png/, loader: "url-loader?limit=10000&mimetype=image/png"},
      {test: /\.svg/, loader: "url-loader?limit=10000&mimetype=image/svg"},

      // Load fonts
      {
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"},
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      React: "react",
      ReactDOM: "react-dom",
      CodeMirror: "codemirror",
    }),
    ...(DEBUG
      ? [new webpack.HotModuleReplacementPlugin()]
      : [
      new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
      new ExtractTextPlugin("style.css", {allChunks: false}),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {screw_ie8: true, keep_fnames: true, warnings: false},
        mangle: {screw_ie8: true, keep_fnames: true}
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
    ])
  ],

  resolveLoader: {
    root: path.join(__dirname, "node_modules"),
  },

  resolve: {
    root: path.join(__dirname, "node_modules"),

    modulesDirectories: ['node_modules', 'non_npm_modules'],

    alias: {
      environment: DEBUG
        ? path.resolve(__dirname, 'config', 'environments', 'development.js')
        : path.resolve(__dirname, 'config', 'environments', 'production.js')
    },

    // Allow to omit extensions when requiring these files
    extensions: ["", ".js", ".jsx"],
  }
});
