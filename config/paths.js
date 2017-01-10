const path = require('path');

const root = path.join(__dirname, '..');
const client = path.join(root, 'app');
const publForProd = path.join(__dirname, 'public');
const dist = path.join(root, 'dist');
const distPubl = path.join(dist, 'public');
const vendors = path.join(root, 'vendors');
const server = path.join(root, 'server');
const config = path.join(root, 'config');
const modules = path.join(root, 'node_modules');
const webpack = path.join(root, 'webpack');

module.exports = {
  root,
  client,
  publForProd,
  dist,
  vendors,
  server,
  config,
  modules,
  webpack,
  distPubl
};