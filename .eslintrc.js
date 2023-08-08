// .eslintrc.js

module.exports = {
  root: true,
  env: {
    browser: true,
    jest: true,
    es6: true,
    es2020: true, // <- activate “es2020” globals
    node: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  plugins: [
    "react-hooks"
  ],
  parser: '@typescript-eslint/parser',

    settings: {
   
    indent: ["error", 2],
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};

