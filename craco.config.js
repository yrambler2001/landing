/* eslint-disable */
const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    // This plugin takes care of the .less files
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {},
          },
        },
      },
    },
    // This plugin take scare of the .less.module files
    {
      plugin: CracoLessPlugin,
      options: {
        modifyLessRule: function (lessRule, _context) {
          lessRule.test = /\.(less)$/;
          lessRule.use = [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
              },
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  modifyVars: {},
                  javascriptEnabled: true,
                },
              },
            },
          ];
          lessRule.exclude = /node_modules/;
          return lessRule;
        },
      },
    },
  ],
  webpack: {
    module: {
      rules: [
        {
          test: /\.less$/i,
          use: [
            {
              loader: 'raw-loader',
            },
            {
              loader: 'less-loader',
            },
          ]
        }
      ],
    },
  },
};
