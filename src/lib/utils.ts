import {
  IExtractedPathParam,
  IRegexParams,
  IUriParams
} from '../interfaces'


/**
 *
 * @param source
 * @param param
 * @param regexParams
 */
export function copyPathParams(source: IUriParams, param: IExtractedPathParam, regexParams?: IRegexParams): IUriParams {

  const ret: IUriParams = { pathParams: [...source.pathParams, param] }

  if (regexParams) {
    if (source.regexParams) {
      ret.regexParams = [...source.regexParams, regexParams]
    } else {
      ret.regexParams = [regexParams]
    }
  }

  return ret;
}


export class ExtractedPathParam implements IExtractedPathParam {
  constructor(public readonly paramName: string, public readonly paramValue: string){}
}

export class RegexParams implements IRegexParams {
  constructor(public readonly paramName: string, public readonly params: Array<string>){}
}
