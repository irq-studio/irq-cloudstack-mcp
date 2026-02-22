import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript handles these
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Allow empty interfaces that extend a base type (used for self-documenting APIs)
      '@typescript-eslint/no-empty-object-type': ['error', {
        allowInterfaces: 'with-single-extends',
      }],

      // Allow explicit any in some cases (CloudStack API responses vary)
      '@typescript-eslint/no-explicit-any': 'warn',

      // Require explicit return types on exported functions
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Allow empty functions (useful for mocks/stubs)
      '@typescript-eslint/no-empty-function': 'warn',

      // Require await in async functions
      '@typescript-eslint/require-await': 'off',

      // Allow non-null assertions (useful with CloudStack API responses)
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      }],
    },
  },
  {
    // Test file overrides
    files: ['**/*.test.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Ignore patterns
    ignores: [
      'build/**',
      'node_modules/**',
      'coverage/**',
      '*.js',
      '*.cjs',
    ],
  }
);
