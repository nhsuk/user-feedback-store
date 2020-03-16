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
