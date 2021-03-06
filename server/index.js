import express from 'express';
import webpack from 'webpack';
// import { isDev } from '../config/app';
// import { connect } from './db';
// import initPassport from './init/passport';
import initExpress from './init/express';
import initRoutes from './init/routes';
// import renderMiddleware from '../app/server';


const app = express();

/*
 * Database-specific setup
 * - connect to MongoDB using mongoose
 * - register mongoose Schema
 */
// connect();

/*
 * REMOVE if you do not need passport configuration
 */
// initPassport( );

if (isDev) {
  const webpackDevConfig = require('../webpack/webpack.config.client.babel').default;

  const compiler = webpack(webpackDevConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackDevConfig.output.publicPath
  }));

  app.use(require('webpack-hot-middleware')(compiler));
}

/*
 * Bootstrap application settings
 */
initExpress(app);

/*
 * REMOVE if you do not need any routes
 *
 * Note: Some of these routes have passport and database model dependencies
 */
initRoutes(app);

/*
 * This is where the magic happens. We take the locals data we have already
 * fetched and seed our stores with data.
 * renderMiddleware is a function that requires store data and url
 * to initialize and return the React-rendered html string
 */
// app.get('*', renderMiddleware);

app.listen(app.get('port'));
