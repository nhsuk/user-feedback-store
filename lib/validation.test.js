/* global expect */

const validation = require('./validation.js');

describe('validate initial response', () => {
  it('when isSatisfied is true', () => {
    const dirtyData = { isSatisfied: true, url: 'https://example.com/' };
    const cleanData = validation.validateInitialResponse(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when isSatisfied is false', () => {
    const dirtyData = { isSatisfied: false, url: 'https://example.com/' };
    const cleanData = validation.validateInitialResponse(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when isSatisfied is invalid', () => {
    const dirtyData = { isSatisfied: null, url: 'https://example.com/' };
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('isSatisfied must be true or false');
  });

  it('when isSatisfied is missing', () => {
    const dirtyData = { url: 'https://example.com/' };
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('isSatisfied must be true or false');
  });

  it('when url is missing', () => {
    const dirtyData = { isSatisfied: true };
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('url must be a valid URL');
  });

  it('when url is not a valid URL', () => {
    const dirtyData = { isSatisfied: true, url: 'bobloblawlawblog' };
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('url must be a valid URL');
  });
});

describe('validate text comments', () => {
  it('when comments are valid', () => {
    const dirtyData = { comments: 'More cowbell' };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when comments are not a string', () => {
    const dirtyData = { comments: false };
    expect(() => {
      validation.validateTextComments(dirtyData);
    }).toThrow('comments must be a string');
  });

  it('when comments are too long', () => {
    const dirtyData = { comments: 'A'.repeat(1001) };
    expect(() => {
      validation.validateTextComments(dirtyData);
    }).toThrow('comments too long');
  });

  it('when comments are long but not too long', () => {
    const longString = 'A'.repeat(1000);
    const dirtyData = { comments: longString };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('whitespace is trimmed', () => {
    const dirtyData = { comments: '  a silly string with whitespace padding  ' };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual({ comments: 'a silly string with whitespace padding' });
  });
});
