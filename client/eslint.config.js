import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'public']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Data-fetch-on-mount effects (calling load() in useEffect) are a standard
      // idiom throughout the app; the react-hooks v7 rule flags them as cascading
      // renders, which is a false positive for one-shot fetches here.
      'react-hooks/set-state-in-effect': 'off',
      // Experimental React Compiler purity rule false-positives on legitimate
      // imperative code: three.js camera mutation inside useFrame, ref updates in
      // event handlers, and Date.now()/new Date() in render.
      'react-hooks/purity': 'off',
      // Same experimental rule-set: we intentionally mutate refs (camera control)
      // and three.js objects imperatively, which this rule disallows.
      'react-hooks/immutability': 'off',
    },
  },
])
