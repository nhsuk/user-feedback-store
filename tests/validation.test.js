/* global expect */

const validation = require('../feedback/lib/validation.js');

describe('validate initial response', () => {
  it('when answer is true', () => {
    const dirtyData = { answer: true };
    const cleanData = validation.validateInitialResponse(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when answer is false', () => {
    const dirtyData = { answer: false };
    const cleanData = validation.validateInitialResponse(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when answer is invalid', () => {
    const dirtyData = { answer: null };
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('answer must be true or false');
  });

  it('when answer is missing', () => {
    const dirtyData = {};
    expect(() => {
      validation.validateInitialResponse(dirtyData);
    }).toThrow('answer must be true or false');
  });
});

describe('validate text comments', () => {
  it('when comments are valid', () => {
    const dirtyData = { comment: 'More cowbell' };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('when comments are not a string', () => {
    const dirtyData = { comment: false };
    expect(() => {
      validation.validateTextComments(dirtyData);
    }).toThrow('comment must be a string');
  });

  it('when comments are too long', () => {
    const dirtyData = { comment: 'A'.repeat(1001) };
    expect(() => {
      validation.validateTextComments(dirtyData);
    }).toThrow('comment too long');
  });

  it('when comments are long but not too long', () => {
    const longString = 'A'.repeat(1000);
    const dirtyData = { comment: longString };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual(dirtyData);
  });

  it('whitespace is trimmed', () => {
    const dirtyData = { comment: '  a silly string with whitespace padding  ' };
    const cleanData = validation.validateTextComments(dirtyData);
    expect(cleanData).toEqual({ comment: 'a silly string with whitespace padding' });
  });
});
