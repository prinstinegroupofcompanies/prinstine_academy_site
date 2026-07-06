import {
  isPrimaryDeveloperAuthorized,
  printUnauthorizedMessage,
} from './primary-developer.mjs'

if (!isPrimaryDeveloperAuthorized()) {
  printUnauthorizedMessage()
  process.exit(1)
}
