module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier/@typescript-eslint'
    ],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    env: {
        jest: true,
        node: true,
        browser: true
    }
};
