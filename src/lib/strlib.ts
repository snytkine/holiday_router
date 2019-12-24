import {
  ISplitResult,
  UriParamResult,
  ROUTE_PATH_SEPARATOR,
} from '../interfaces';

export module Strlib {

  export function splitUriByPathSeparator(s: string, separators: Array<string>): ISplitResult {

    let i = 0;
    const ret = {
      head: '',
      tail: ''
    }

    for (const char of s) {
      ret.head += char;
      i+=1;
      if (separators.includes(char)) {
        break;
      }
    }

    ret.tail = s.substring(i);

    return ret;
  }

  export function extractUriParam(uri: string, prefix: string = '', postfix: string = ''): UriParamResult | null {

    let param: string = '';
    let prefixLen = (prefix && prefix.length) || 0;
    let postfixLen = (postfix && postfix.length) || 0;
    let acc: string = '';
    let ch: string = '';

    let i = 0;
    let j = 0;

    /**
     * First read until match of prefix
     */
    while (ch !== undefined && i < prefixLen) {

      if (i < prefixLen && prefix[i] !== uri[i]) {
        /**
         * Prefix does not match
         *
         */
        return null;
      }

      i += 1;
    }

    while (ch = uri[i]) {

      if (ch === postfix[j]) {
        acc += ch;
        j += 1;
      } else {
        param += acc;
        acc = '';
        j = 0;
        param += ch;
      }

      i += 1;

      if (ch === ROUTE_PATH_SEPARATOR) {
        break;
      }
    }

    if (j !== postfixLen) {
      return null;
    }

    return {
      param,
      rest: uri.substr(i)
    }

  }

}
