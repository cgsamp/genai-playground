module.exports = {
    root: true,
    extends: [
        'next/core-web-vitals',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
