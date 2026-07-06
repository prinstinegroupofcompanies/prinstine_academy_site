import {
  isPrimaryDeveloperAuthorized,
  printUnauthorizedMessage,
  PRIMARY_DEVELOPER,
} from './primary-developer.mjs'

if (!isPrimaryDeveloperAuthorized()) {
  console.warn(`
--------------------------------------------------------------------------------
  RESTRICTED REPOSITORY

  Primary Developer: ${PRIMARY_DEVELOPER.name}
  Contact before running: ${PRIMARY_DEVELOPER.email}

  See PRIMARY_DEVELOPER.md in the repo root.
--------------------------------------------------------------------------------
`)
}
