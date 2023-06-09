const path = require('path')

const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: './index.js',
  target: 'node',
  externals: [nodeExternals()],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
