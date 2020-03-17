# User Feedback Form Backend

Backend for saving data posted from the user-feedback-form frontend.

## Getting started

1. Start a local [mongo database](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)

2. Install [azure core tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#v2)

3. Install dependencies `npm install`.

4. Copy `local.settings.example.json` to `local.settings.json`.

5. Run function `func start`.

The default mongo connection string is `http://localhost` which can be changed by editing the `local.settings.json` file.

## API

All endpoints expect a POST request with a JSON body.

### Unique tokens

All responses contain a unique token. This token should be stored in memory, and updated after each API call.
After the first request, the token should be passed to each subsequent request in a single feedback user journey.

The token is used to link answers together so that text comments can be associated with the satisfaction answer.

The token **should never** be stored on the client such as in a cookie or local storage.

#### Example response
```json
{
    "status": "ok",
    "token": "123e4567-e89b-12d3-a456-426655440000",
}
```

### Satisfied

Is the user satisfied? Yes or No.

`POST /satisfied/`

#### Payload

- `isSatisfied` - `true` for "Yes" and `false` for "No"
- `token` (optional) - See [Unique tokens](#unique-tokens)

#### Example request
```json
{
  "isSatisfied": true,
  "token": "123e4567-e89b-12d3-a456-426655440000",
}
```

### Comments

Free-text user comments.

`POST /comments/`

#### Payload

- `comments` - Maximum 1000 characters
- `token` - See [Unique tokens](#unique-tokens)

#### Example request
```json
{
    "comments": "Could do with a bit more cowbell.",
    "token": "123e4567-e89b-12d3-a456-426655440000",
}
```

## Contributing

### Tests

`npm test` to run jest tests.

`npm test -- --watch` to continuously run tests while in development.

`npm run lint` to run eslint.

### Docs

Code is documented in [jsdoc](https://jsdoc.app/) style.
