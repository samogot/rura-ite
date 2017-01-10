import webpack from 'webpack';
import paths from '../config/paths';
import nodeExternals from 'webpack-node-externals';
import {isDev} from '../config/app';

export default {
  // The configuration for the server-side rendering
  name: 'server',
  context: paths.root,
  entry: {
    server: './server/index'
  },
  target: 'node',
  node: {
    __dirname: false
  },
  devtool: 'sourcemap',
  output: {
    // The output directory as absolute path
    path: paths.dist,
    // The filename of the entry chunk as relative path inside the output.path directory
    filename: 'server.js',
    // The output path from the view of the Javascript
    publicPath: '/',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      // Load ES6/JSX
      {
        test: /\.jsx?$/,
        include: [
          paths.server, paths.config, paths.webpack
        ],
        loader: "babel",
        query: {
          presets: ['latest', 'stage-0'],
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  externals: [nodeExternals({modulesDir: paths.modules})],
  plugins: [
    new webpack.DefinePlugin({isDev: JSON.stringify(isDev)}),
    new webpack.BannerPlugin(
      'require("source-map-support").install();',
      {raw: true, entryOnly: false}
    )
  ]
};
