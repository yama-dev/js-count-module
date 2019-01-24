const env = process.env.NODE_ENV;

const webpack = require('webpack');

const config = {
  mode: env || 'development',
  entry: ['./src/js-count-module.js'],
  output: {
    path: `${__dirname}/dist`,
    filename: 'js-count-module.js',
    library: 'JS_COUNT_MODULE',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env', {
                    'modules': false,
                    'targets': {
                      'ie': '11'
                    },
                    'useBuiltIns': 'usage'
                  }
                ]
              ]
            }
          }
        ],
        exclude: /node_modules/,
      }
    ]
  }
};

module.exports = config;
