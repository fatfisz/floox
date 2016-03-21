'use strict';

const should = require('should/as-function');
const sinon = require('sinon');

const defaultCombineState = require('../dist/default_combine_state');


describe('defaultCombineState', () => {
  it('should return the partial state if the type of the current state is not `object`', () => {
    const result = defaultCombineState('not_object', 'partial');

    should(result).be.equal('partial');
  });

  it('should return the partial state if the type of the partial state is not `object`', () => {
    const result = defaultCombineState({}, 'partial');

    should(result).be.equal('partial');
  });

  it('should return the partial state if the current state is null', () => {
    const result = defaultCombineState(null, 'partial');

    should(result).be.equal('partial');
  });

  it('should assign the partial state if both states have type `object` and the current state is not null', () => {
    const current = {
      a: 1,
      b: 2,
    };
    const partial = {
      b: 3,
      c: 4,
    };
    const result = defaultCombineState(current, partial);

    should(result).be.equal(current);
    should(result).be.eql({
      a: 1,
      b: 3,
      c: 4,
    });
  });

  it('should assign the partial state if the current state is an object and the partial state is null', () => {
    const current = {
      a: 1,
      b: 2,
    };
    const result = defaultCombineState(current, null);

    should(result).be.equal(current);
    should(result).be.eql({
      a: 1,
      b: 2,
    });
  });

  it('should call the partial state with the current state if it\'s a function', () => {
    const partial = sinon.stub().returns('combined state');
    const result = defaultCombineState('current state', partial);

    should(partial).be.calledOnce();
    should(partial).be.calledWithExactly('current state');
    should(result).be.equal('combined state');
  });
});
