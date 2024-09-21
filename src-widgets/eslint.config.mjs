import onlyWarn from 'eslint-plugin-only-warn';
import react from 'eslint-plugin-react';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
    'plugin:eqeqeq-fix/recommended',
), {
    plugins: {
        'only-warn': onlyWarn,
        react,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        ecmaVersion: 'latest',
        sourceType: 'module',

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    rules: {
        'arrow-parens': [1, 'as-needed'],
        'react/jsx-indent': 'off',
        'react/jsx-indent-props': 'off',
        'react/no-access-state-in-setstate': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'no-plusplus': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-render-return-value': 'off',
        'max-len': 'off',
        'react/destructuring-assignment': 'off',
        'react/prefer-stateless-function': 'off',
        'react/self-closing-comp': 'off',
        'react/jsx-filename-extension': 'off',
        'no-nested-ternary': 'off',
        'react/no-array-index-key': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/sort-comp': 'off',
        'react/no-did-update-set-state': 'off',
        'global-require': 'off',
        'import/extensions': 'off',
        'operator-linebreak': 'off',
        'no-unused-expressions': 'off',
        'prefer-destructuring': 'off',
        'no-return-assign': 'off',
        'no-multi-spaces': 'off',
        'key-spacing': 'off',
        'no-undef': 2,
        'react/forbid-prop-types': 'off',
        'react/require-default-props': 'off',
        'import/no-extraneous-dependencies': 'off',
        'react/jsx-wrap-multilines': 'off',
        'react/jsx-closing-tag-location': 'off',
        'no-restricted-syntax': 'off',
        'guard-for-in': 'off',
        'linebreak-style': ['off'],
        'no-param-reassign': 'off',
        'no-await-in-loop': 'off',

        'no-console': ['error', {
            allow: ['warn', 'error', 'log'],
        }],

        'no-underscore-dangle': 'off',
        'no-constant-condition': 'off',
        'no-loop-func': 'off',
        'no-continue': 'off',
        'implicit-arrow-linebreak': 'off',
        radix: 'off',

        indent: ['error', 4, {
            SwitchCase: 1,
        }],

        'no-alert': 'off',
        'react/function-component-definition': 'off',
    },
}];
