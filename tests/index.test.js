/* global expect jest */

const httpFunction = require('../feedback/index.js');
const { ValidationError } = require('../feedback/lib/validation.js');
const context = require('./defaultContext.js');

jest.mock('../feedback/lib/database.js');
const database = require('../feedback/lib/database.js');

describe('http trigger', () => {
  beforeEach(() => {
    database.saveInitialResponse.mockClear();
    database.saveTextComments.mockClear();
  });

  it('returns ok when answer=true', async () => {
    const request = {
      body: { answer: true },
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { ok: true } });
    expect(database.saveInitialResponse).toBeCalledWith({ answer: true });
  });

  test('returns ok when answer=false', async () => {
    const request = {
      body: { answer: false },
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { ok: true } });
    expect(database.saveInitialResponse).toBeCalledWith({ answer: false });
  });

  test('returns 500 error when database save goes wrong', async () => {
    database.saveInitialResponse = jest.fn().mockImplementation(async () => {
      throw new Error('msg');
    });
    const request = {
      body: { answer: true },
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { error: 'Something went wrong' }, status: 500 });
  });

  test('returns error when validation fails', async () => {
    database.saveInitialResponse = jest.fn().mockImplementation(async () => {
      throw new ValidationError('some validation message');
    });
    const request = {
      body: { answer: true },
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { error: 'some validation message' }, status: 400 });
  });

  test('returns error when no body given', async () => {
    const request = {};
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { error: 'Please pass a JSON request body' }, status: 400 });
  });

  test('returns ok when text comments are given', async () => {
    const request = {
      body: { comment: 'Needs more cowbell.' },
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { ok: true } });
    expect(database.saveTextComments).toBeCalledWith({ comment: 'Needs more cowbell.' });
  });

  test('calls the saveTextComments when no answer is given', async () => {
    const request = {
      body: {},
    };
    const response = await httpFunction(context, request);
    expect(response).toEqual({ body: { ok: true } });
    expect(database.saveTextComments).toBeCalledWith({});
  });
});
