
import { expect } from 'chai';
import { copyPathParams, makeParam, makeRegexParam } from '../../lib/utils'
import { UriParams } from '../../interfaces'

describe('#utils.ts', () => {

  describe('#copyPathPrams', () => {

    it('#copyPathParams should contain new param. Original pathParam should not be modified', () => {

      const origparams: UriParams = {
        pathParams: [makeParam('id', '11')]
      }
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

      const origparams: UriParams = {
        pathParams: [makeParam('id', '11')]
      }

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
})
