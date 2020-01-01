import { ISplitResult, UriParamResult, ROUTE_PATH_SEPARATOR } from '../interfaces';

export module Strlib {
  export function splitUriByPathSeparator(s: string, separators: Array<string>): ISplitResult {
    let i: number;
    let char: string;
    const ret = {
      head: '',
      tail: '',
    };

    for (i = 0; i < s.length; i += 1) {
      char = s[i];
      ret.head += char;
      if (separators.includes(char)) {
        break;
      }
    }

    ret.tail = s.substring(i + 1);

    return ret;
  }

  export function extractUriParam(
    uri: string,
    prefix: string = '',
    postfix: string = '',
  ): UriParamResult | null {
    let param: string = '';
    const prefixLen = (prefix && prefix.length) || 0;
    const postfixLen = (postfix && postfix.length) || 0;
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

    while (uri[i]) {
      ch = uri[i];
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
      rest: uri.substr(i),
    };
  }
}
