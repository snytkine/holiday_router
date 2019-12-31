import { expect } from 'chai';
import { Utils } from '../../utils';
import { ExtractedPathParam, ExtractedRegexParams } from '../../lib';
import { IUriParams } from '../../interfaces';

describe('#copyparams.ts', () => {
  it('#copyPathParams should contain new param. Original pathParam should not be modified', () => {
    const origparams: IUriParams = {
      pathParams: [new ExtractedPathParam('id', '11')],
    };
    const extraParam = new ExtractedPathParam('model', 'T');

    const copiedParams = Utils.copyPathParams(origparams, extraParam);

    expect(copiedParams.pathParams.length).to.equal(2);

    expect(copiedParams.pathParams).to.contain(extraParam);

    expect(origparams.pathParams.length).to.equal(1);

    expect(origparams.pathParams).to.not.contain(extraParam);
  });

  it('#copyPathParams with regexParam should contain new param. Original pathParam should not be modified', () => {
    const origparams: IUriParams = {
      pathParams: [new ExtractedPathParam('id', '11')],
    };

    const extraParam = new ExtractedPathParam('model', 'T');
    const regexParam = new ExtractedRegexParams('id', ['p1', 'p2']);

    const copiedParams = Utils.copyPathParams(origparams, extraParam, regexParam);

    expect(copiedParams.pathParams.length).to.equal(2);

    expect(copiedParams.regexParams.length).to.equal(1);

    expect(copiedParams.regexParams).to.contain(regexParam);

    expect(origparams.pathParams.length).to.equal(1);

    expect(origparams).to.not.haveOwnProperty('regexParams');
  });
});
