import {
  ExtractedPathParam,
  RegexParams,
  UriParams
} from '../interfaces'


/**
 *
 * @param source
 * @param param
 * @param regexParams
 */
export function copyPathParams(source: UriParams, param: ExtractedPathParam, regexParams?: RegexParams): UriParams {

  const ret: UriParams = { pathParams: [...source.pathParams, param] }

  if (regexParams) {
    if (source.regexParams) {
      ret.regexParams = [...source.regexParams, regexParams]
    } else {
      ret.regexParams = [regexParams]
    }
  }

  return ret;
}

export function makeParam(name: string, value: string): ExtractedPathParam {

  const ret: ExtractedPathParam = {
    paramName:  name,
    paramValue: value
  }

  return ret;
}

export function makeRegexParam(paramName: string, params: Array<string>): RegexParams {

  return {
    paramName,
    params
  }
}
