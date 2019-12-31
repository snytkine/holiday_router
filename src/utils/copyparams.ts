import { IExtractedPathParam, IRegexParams, IUriParams } from '../interfaces';

export module Utils {
  export function copyPathParams(
    source: IUriParams,
    param: IExtractedPathParam,
    regexParams?: IRegexParams,
  ): IUriParams {
    const ret: IUriParams = { pathParams: [...source.pathParams, param] };

    if (regexParams) {
      if (source.regexParams) {
        ret.regexParams = [...source.regexParams, regexParams];
      } else {
        ret.regexParams = [regexParams];
      }
    }

    return ret;
  }
}
