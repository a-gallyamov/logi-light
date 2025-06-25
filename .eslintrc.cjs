const { configure, presets } = require('eslint-kit');

const prettierConfig = {
  printWidth: 130,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  bracketSpacing: true,
  jsxBracketSameLine: false,
};

module.exports = configure({
  allowDebug: process.env.NODE_ENV !== 'production',
  presets: [
    presets.node(),
    presets.react(),
    presets.imports(),
    presets.prettier(prettierConfig),
    presets.typescript(),
    presets.effector({ future: true }),
    presets.react({ version: 'detect' }),
  ],
  extend: {
    plugins: ['react-refresh', 'react-hooks'],
    parserOptions: {
      project: ['./tsconfig.app.json'],
      tsconfigRootDir: __dirname,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_+',
          varsIgnorePattern: '^_+',
          caughtErrorsIgnorePattern: '^_+',
        },
      ],
      'max-len': [
        'warn',
        {
          ignoreComments: true,
          ignoreUrls: true,
          code: 130,
        },
      ],
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-else-return': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': ['warn'],
    },
  },
});
