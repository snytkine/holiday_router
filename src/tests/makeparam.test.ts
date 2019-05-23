import {
  makeParam,
  makeRegexParam
} from '../lib'

export {
  makeParam,
  makeRegexParam
} from '../lib/makeparam';
import { expect } from 'chai';

describe('#makeparam.ts', () => {

  describe('#makeParam', () => {
    it('#should create param object', () => {
      const param = makeParam('id', '23');
      expect(param)
      .to
      .have
      .property('paramName', 'id');

      expect(param)
      .to
      .have
      .property('paramValue', '23');
    })
  })

  describe('#makeRegexParam', () => {

    it('#should create regex param', () => {

      const param = makeRegexParam('id', ['p1', 'p2']);
      expect(param)
      .to
      .haveOwnProperty('paramName', 'id');

    })
  })
})
