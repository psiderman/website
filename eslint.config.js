import js from '@eslint/js'
// import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import perfectionist from 'eslint-plugin-perfectionist'
import * as regexp from 'eslint-plugin-regexp'
import tailwind from 'eslint-plugin-tailwindcss'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import vueAccessibility from 'eslint-plugin-vuejs-accessibility'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfigWithVueTs(
  /*
   * Ignore generated files
   */
  {
    ignores: [
      '**/dist/**',
      '**/*.d.ts',
      '**/.cloudflared/**',
      'package-lock.json',
      '**/.vercel/**',
      '**/.*/**',
      '**/*.yml',
      '**/*.yaml',
      'supabase/functions/**',
    ],

    name: 'app/ignores',
  },
  /*
   * Base setup
   */
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,vue}'],

    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      sourceType: 'module',
    },

    name: 'app/setup',
  },

  /*
   * Recommended configs
   */
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/strongly-recommended'],
  regexp.configs['flat/recommended'],
  // ...vueI18n.configs['flat/recommended'],
  vueTsConfigs.recommended,

  /*
   * Sorting
   */
  perfectionist.configs['recommended-natural'],

  /*
   * Project rules
   */
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,vue}'],
    name: 'app/rules',

    plugins: {
      tailwindcss: tailwind,
      'unused-imports': unusedImports,
      'vuejs-accessibility': vueAccessibility,
    },

    rules: {
      /*
       * Console / debugger
       */

      /* '@intlify/vue-i18n/no-raw-text': [
        'warn',
        {
          ignorePattern: '^[-#:()&]+$',
          ignoreText: ['...'],
        },
      ], */

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unsafe-argument': 'error',
      // catches assignment from `any`
      '@typescript-eslint/no-unsafe-assignment': 'error',
      // usually useful together
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',

      /*
       * TypeScript
       */

      '@typescript-eslint/no-unsafe-return': 'error',

      '@typescript-eslint/no-unused-vars': 'off',

      'no-console': [
        isProduction ? 'error' : 'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': isProduction ? 'error' : 'warn',

      /*
       * Unused imports
       */

      'no-unused-vars': 'off',

      'perfectionist/sort-exports': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],

      /*
       * Import sorting
       */

      'perfectionist/sort-imports': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          newlinesBetween: 1,
          order: 'asc',
          type: 'natural',
        },
      ],

      'perfectionist/sort-named-exports': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],

      'perfectionist/sort-named-imports': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],

      /*
       * Tailwind
       */
      'tailwindcss/classnames-order': 'off', // handled by prettier-plugin-tailwindcss

      /*
       * Vue
       */

      'tailwindcss/no-custom-classname': 'off', // Tailwind v4 dynamic classes

      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],

      'vue/attributes-order': [
        'error',
        {
          alphabetical: false,
        },
      ],

      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],

      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

      'vue/html-self-closing': [
        'error',
        {
          html: {
            component: 'always',
            normal: 'never',
            void: 'always',
          },

          math: 'always',
          svg: 'always',
        },
      ],

      'vue/no-multiple-template-root': 'off',

      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/require-default-prop': 'off',

      /*
       * Accessibility (warnings for progressive adoption)
       */
      'vuejs-accessibility/alt-text': 'warn',
      'vuejs-accessibility/anchor-has-content': 'warn',
      'vuejs-accessibility/aria-props': 'warn',
      'vuejs-accessibility/aria-role': 'warn',
      'vuejs-accessibility/aria-unsupported-elements': 'warn',
      'vuejs-accessibility/click-events-have-key-events': 'warn',
      'vuejs-accessibility/form-control-has-label': 'warn',
      'vuejs-accessibility/heading-has-content': 'warn',
      'vuejs-accessibility/iframe-has-title': 'warn',
      'vuejs-accessibility/interactive-supports-focus': 'warn',
      'vuejs-accessibility/label-has-for': 'warn',
      'vuejs-accessibility/media-has-caption': 'warn',
      'vuejs-accessibility/mouse-events-have-key-events': 'warn',
      'vuejs-accessibility/no-access-key': 'warn',
      'vuejs-accessibility/no-autofocus': 'warn',
      'vuejs-accessibility/no-distracting-elements': 'warn',
      'vuejs-accessibility/no-redundant-roles': 'warn',
      'vuejs-accessibility/no-static-element-interactions': 'warn',
      'vuejs-accessibility/role-has-required-aria-props': 'warn',
      'vuejs-accessibility/tabindex-no-positive': 'warn',
    },

    settings: {
      /* 'vue-i18n': {
        localeDir: './src/locales/*.{json,json5,yaml,yml}',
        messageSyntaxVersion: '^9.0.0',
      }, */
    },
  },

  /*
   * Disable strict rules for test files
   */
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  /*
   * Prettier compatibility
   */
  skipFormatting,

  /*
   * JSON compatibility
   */
  {
    files: ['**/*.json', '**/*.json5', '**/*.yml', '**/*.yaml'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-expressions': 'off',
      'perfectionist/sort-objects': 'off',
    },
  },
)
