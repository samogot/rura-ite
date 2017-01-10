import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import paths from '../config/paths';
import {isDev} from '../config/app';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const addHash = (template, hash, hash2) => isDev ? `${template}?hash=[${hash2||hash}]` : template.replace(/\.[^.]+$/, `.[${hash}]$&`);

const hotMiddlewareScript = '';
export default {
  name: 'client',
  entry: {
    main: [
      ...isDev ? ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'] : [],
      'babel-polyfill',
      './app/main.styl',
      './app/main',
    ]
  },

  output: {
    path: paths.distPubl,
    filename: addHash('[name].js', 'chunkhash', 'hash'),
    chunkFilename: addHash('[id].js', 'chunkhash', 'hash'),
    publicPath: "/"
  },

  cache: isDev,
  debug: isDev,

  // For options, see http://webpack.github.io/docs/configuration.html#devtool
  devtool: isDev ? "eval" : "source-map",

  module: {
    loaders: [
      // Load ES6/JSX
      {
        test: /\.jsx?$/,
        include: [
          paths.client,
        ],
        loader: "babel-loader",
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0', 'react', ...isDev ? ['react-hmre'] : ['react-optimize']],
        }
      },

      // Load styles
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!stylus-loader")
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")
      },

      // Load images
      {
        test: /\.jpg/,
        loader: "url-loader?limit=10000&mimetype=image/jpg" + addHash('&name=[path][name].[ext]', 'hash:6')
      },
      {
        test: /\.gif/,
        loader: "url-loader?limit=10000&mimetype=image/gif" + addHash('&name=[path][name].[ext]', 'hash:6')
      },
      {
        test: /\.png/,
        loader: "url-loader?limit=10000&mimetype=image/png" + addHash('&name=[path][name].[ext]', 'hash:6')
      },
      {
        test: /\.svg/,
        loader: "url-loader?limit=10000&mimetype=image/svg" + addHash('&name=[path][name].[ext]', 'hash:6')
      },

      // Load fonts
      {
        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff" + addHash('&name=[path][name].[ext]', 'hash:6')
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader" + addHash('?name=[path][name].[ext]', 'hash:6')
      },
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      React: "react",
      ReactDOM: "react-dom",
      CodeMirror: "codemirror",
    }),
    new ExtractTextPlugin(addHash('[name].css', 'contenthash'), {allChunks: false, disable: isDev}),
    new webpack.DefinePlugin({isDev: JSON.stringify(isDev)}),
    new HtmlWebpackPlugin({
      template: 'app/template.html'
    }),
    ...(isDev
      ? [new webpack.HotModuleReplacementPlugin()]
      : [
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
    root: paths.modules,
  },

  resolve: {
    root: [paths.modules, paths.vendors, paths.client],

    // Allow to omit extensions when requiring these files
    extensions: ["", ".js", ".jsx"],
  }
};
