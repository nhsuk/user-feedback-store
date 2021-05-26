/* global expect jest */

const { handleComments, handleSatisfied, handleHealthcheck } = require('./index.js');
const { ValidationError } = require('./validation.js');
const context = require('../tests/unit/defaultContext.js');

jest.mock('./database.js');
const database = require('./database.js');

describe('http handler for /satisfied/', () => {
  beforeEach(() => {
    database.saveInitialResponse.mockClear();
  });

  it('returns ok when answer=true', async () => {
    const request = {
      body: { isSatisfied: true },
    };
    const response = await handleSatisfied(context, request);
    expect(response).toMatchObject({ body: { status: 'ok' } });
    expect(database.saveInitialResponse).toBeCalledWith({ isSatisfied: true, token: null });
  });

  test('returns ok when answer=false', async () => {
    const request = {
      body: {
        isSatisfied: false,
      },
    };
    const response = await handleSatisfied(context, request);
    expect(response).toMatchObject({ body: { status: 'ok' } });
    expect(database.saveInitialResponse).toBeCalledWith({ isSatisfied: false, token: null });
  });

  test('returns 500 error when database save goes wrong', async () => {
    database.saveInitialResponse = jest.fn().mockImplementation(async () => {
      throw new Error('msg');
    });
    const request = {
      body: { isSatisfied: true },
    };
    const response = await handleSatisfied(context, request);
    expect(response).toMatchObject({ body: { error: 'Something went wrong' }, status: 500 });
  });

  test('returns error when validation fails', async () => {
    database.saveInitialResponse = jest.fn().mockImplementation(async () => {
      throw new ValidationError('some validation message');
    });
    const request = {
      body: { isSatisfied: true },
    };
    const response = await handleSatisfied(context, request);
    expect(response).toMatchObject({ body: { error: 'some validation message' }, status: 400 });
  });

  test('returns error when no body given', async () => {
    const request = {};
    const response = await handleSatisfied(context, request);
    expect(response).toMatchObject({ body: { error: 'Please pass a JSON request body' }, status: 400 });
  });
});

describe('http handler for /comments/', () => {
  beforeEach(() => {
    database.saveTextComments.mockClear();
  });

  test('returns ok when text comments are given', async () => {
    const request = {
      body: {
        comments: 'Needs more cowbell.',
        token: 'my-token',
      },
    };
    const response = await handleComments(context, request);
    expect(response).toMatchObject({ body: { status: 'ok' } });
    expect(database.saveTextComments).toBeCalledWith({ comments: 'Needs more cowbell.', token: 'my-token' });
  });
});

describe('http handler for /healthcheck/', () => {
  beforeEach(() => {
    database.healthcheck.mockClear();
  });

  test('returns ok when database is available', async () => {
    database.healthcheck = jest.fn().mockImplementation(async () => true);
    const request = {};
    const response = await handleHealthcheck(context, request);
    expect(response).toMatchObject({ body: { status: 'ok' } });
  });

  test('returns 503 when database is unavailable', async () => {
    database.healthcheck = jest.fn().mockImplementation(async () => false);
    const request = {};
    const response = await handleHealthcheck(context, request);
    expect(response).toMatchObject({ status: 503 });
  });
});
