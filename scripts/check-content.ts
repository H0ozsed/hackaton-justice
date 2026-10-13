// Loads every content domain: each one validates itself when imported
// (src/lib/content.ts), so any invalid entry makes this script fail.
// Runs before `next build` and in the pre-commit hook. Add new domains here.
import '@/shared/faq'
import '@/shared/games'
import '@/shared/glossary'
import '@/shared/practical-info'
import '@/shared/quiz'
import '@/shared/role-play'
import '@/shared/simulation'

// eslint-disable-next-line no-console -- CLI output
console.log('Content OK')
