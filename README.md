# User Feedback Form Backend

This application is used to store user feedback information, posted to it from the user-feedback-form frontend. The posted data is stored in a Mongo database. The user-feedback-form can be found [here](https://github.com/nhsuk/user-feedback-form)

## Getting started

1. Install dependencies `npm install`.

2. Run the app `npm start`.

### Mongo dev connection

This will start the app with an in-memory mongo database at `mongodb://127.0.0.1:51412/userfeedback`.
While the app is running, you can connect to the mongo database to see what data is being stored using a [mongo client](https://docs.mongodb.com/manual/mongo/).
When the app stops, the data will be lost.

If you would like to connect to your own mongo database, to allow for longer-term storage:

1. Copy the `local.settings.example.json` file to `local.settings.json`.
2. Edit the `MONGO_CONNECTION_STRING` value in `local.settings.json`.
3. Run `npx func start` instead of `npm start` to start the app.

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

## Dependencies

### Mongo DB

The requied Mongo DB is created as part of the Terraform process for this product. 


## CLI

The command line interface can be used for running data-export commands.

From inside the project's root directory, run `node .` for the CLI entrypoint.

All commands make queries on your mongo database. Pass your database connection string with the `--connection-string`
or `-c` flag.

### Comments

Export a comma-separated values output of comments to stdout.

For example,
```sh
node . comments -c mongodb://localhost > comments-file.csv
```

### Averages

Export a comma-separated values output of average satisfaction scores to stdout.

For example,
```sh
node . averages -c mongodb://localhost > averages-file.csv
```

## Contributing

### Tests

`npm test` to run jest tests.

`npm test -- --watch` to continuously run tests while in development.

`npm run lint` to run eslint.

### Docs

Code is documented in [jsdoc](https://jsdoc.app/) style.
