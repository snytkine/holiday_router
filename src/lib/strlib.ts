import {
  ROUTE_PATH_SEPARATOR
} from '../interfaces/constants'
/*

export const escapeRegExp = (text: string): string => {

  return text.replace(/[\\^$|#\s]/g, '\\$&');
}
*/

/**
 * Read string until STRING_SEPARATOR or PATH_SEPARATOR char or until end of string.
 *
 * @param {string} s
 *
 * @returns {head, tail} head is first part of string including separator,
 * tail is rest of string
 */
export const splitBySeparator = (s: string, separators: Array<string>): { head: string, tail: string } => {

  let i,
      ch;
  let ret = {
    head: '',
    tail: ''
  }

  for (i = 0; ch = s[i++]; ch !== undefined) {
    ret.head += ch;
    if (separators.includes(ch)) {
      break;
    }
  }

  ret.tail = s.substring(i);

  return ret;
}

export interface UriParamResult {
  param: string,
  rest: string
}


export const extractUriParam = (uri: string, prefix: string = '', postfix: string = ''): UriParamResult | null => {

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

  /**
   * If string ended before the prefixLen return false
   */
  if (i < prefixLen) {
    return null;
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
