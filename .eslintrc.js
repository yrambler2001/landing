module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'airbnb/hooks', 'plugin:prettier/recommended', 'prettier/react'],
  plugins: ['only-warn', 'prettier'],
  env: {
    browser: true,
    jest: true,
  },
  globals: {},
  rules: {
    'no-use-before-define': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off',
    'no-underscore-dangle': 'off',
    'global-require': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.test.jsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'max-len': 'off',
    'react/jsx-one-expression-per-line': 'off',
    camelcase: 'off',
    'react/react-in-jsx-scope': 0,
    'no-console': 0,
    'no-unused-expressions': 0,
    'import/no-named-as-default': 0,
    'no-throw-literal': 0,
    'import/prefer-default-export': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
};
