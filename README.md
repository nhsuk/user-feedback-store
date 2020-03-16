# User Feedback Form Backend

Backend for saving data posted from the user-feedback-form frontend.

## Getting started

1. Start a local [mongo database](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)

2. Install [azure core tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#v2)

3. Install dependencies `npm install`.

4. Copy `local.settings.example.json` to `local.settings.json`.

5. Run function `func start`.

The default mongo connection string is `http://localhost` which can be changed by editing the `local.settings.json` file.

## Tests

`npm test` to run jest tests.

`npm test -- --watch` to continuously run tests while in development.

`npm run lint` to run eslint.

## Docs

Code is documented in [jsdoc](https://jsdoc.app/) style.
