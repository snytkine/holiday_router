import { IExtractedPathParam, IRegexParams, IUriParams } from '../interfaces';

/**
 *
 * @param source
 * @param param
 * @param regexParams
 */
export default (
  source: IUriParams,
  param: IExtractedPathParam,
  regexParams?: IRegexParams,
): IUriParams => {
  const ret: IUriParams = { pathParams: [...source.pathParams, param] };

  if (regexParams) {
    if (source.regexParams) {
      ret.regexParams = [...source.regexParams, regexParams];
    } else {
      ret.regexParams = [regexParams];
    }
  }

  return ret;
};
