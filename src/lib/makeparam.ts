import {
  ExtractedPathParam,
  RegexParams,
  UriParams
} from '../interfaces'

export const makeParam = (paramName: string, paramValue: string): ExtractedPathParam => {
  return {
    paramName,
    paramValue
  }
}

export const makeRegexParam = (paramName: string, params: Array<string>): RegexParams => {
  return {
    paramName,
    params
  }
}

/**
 *
 * @param {UriParams} source
 * @param {ExtractedPathParam} param
 * @param {RegexParams} regexParams
 * @returns {UriParams}
 */
export const copyPathParams = (source: UriParams, param: ExtractedPathParam, regexParams?: RegexParams): UriParams => {

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
