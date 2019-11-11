import {
  copyPathParams,
  makeParam,
  makeRegexParam
} from '../lib'

export {
  makeParam,
  makeRegexParam
} from '../lib/makeparam';
import { expect } from 'chai';
import { UriParams } from '../interfaces/ifnode'

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

      expect(param)
      .to
      .haveOwnProperty('params');

      expect(param.params)
      .to
      .have
      .members(['p1', 'p2']);

    })
  })

  describe('#copyPathParams', () => {
    const origparams: UriParams = {
      pathParams: [makeParam('id', '11')]
    }

    it('#copyPathParams should contain new param. Original pathParam should not be modified', () => {

      const extraParam = makeParam('model', 'T');

      const copiedParams = copyPathParams(origparams, extraParam);

      expect(copiedParams.pathParams.length)
      .to
      .equal(2)

      expect(copiedParams.pathParams)
      .to
      .contain(extraParam)

      expect(origparams.pathParams.length)
      .to
      .equal(1)

      expect(origparams.pathParams)
      .to
      .not
      .contain(extraParam)
    })

    it('#copyPathParams with regexParam should contain new param. Original pathParam should not be modified', () => {

      const extraParam = makeParam('model', 'T');
      const regexParam = makeRegexParam('id', ['p1', 'p2']);

      const copiedParams = copyPathParams(origparams, extraParam, regexParam);

      expect(copiedParams.pathParams.length)
      .to
      .equal(2)

      expect(copiedParams.regexParams.length)
      .to
      .equal(1)

      expect(copiedParams.regexParams)
      .to
      .contain(regexParam)

      expect(origparams.pathParams.length)
      .to
      .equal(1)

      expect(origparams)
      .to
      .not
      .haveOwnProperty('regexParams')

    })


  })
})
