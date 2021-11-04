# User Feedback Form Backend

Backend for saving data posted from the user-feedback-form frontend.

## Getting started

1. Install dependencies `npm install`.

2. Copy `local.settings.example.json` to `local.settings.json`.

3. Run the app `npm start`.

This will start the app with an in-memory mongo database at `mongodb://127.0.0.1:51412/userfeedback`.
While the app is running, you can connect to the mongo database to see what data is being stored using a [mongo client](https://docs.mongodb.com/manual/mongo/).
When the app stops, the data will be lost.

If you would like to connect to your own local database, to allow for longer-term storage, edit the `MONGO_CONNECTION_STRING` variable in `local.settings.json` and run `npx func start` instead of `npm start`.

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

### Healthcheck

Test the health of the function. Useful for monitoring.

Returns a 503 response if database is unreachable. 200 OK otherwise.

`GET /healthcheck/`

### Setup

Run database setup commands such as creating indexes.
This endpoint is protected by authentication.
Your deployment mechanism should call this endpoint after each deployment.

`POST /setup/`

#### Payload

none

## Contributing

### Tests

`npm test` to run jest tests.

`npm test -- --watch` to continuously run tests while in development.

`npm run lint` to run eslint.

### Docs

Code is documented in [jsdoc](https://jsdoc.app/) style.
