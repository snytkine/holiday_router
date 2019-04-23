import {
  RouteMatchResult,
  URI_PATH_SEPARATOR
} from '../interfaces/ifnode'
import { makeParam } from './index'

export const escapeRegExp = (text: string): string => {
  // -[\]()*+?.,
  return text.replace(/[\\^$|#\s]/g, '\\$&');
}

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

export const extractUriParam = (uri: string, separator?: string): UriParamResult | null => {
  /**
   * If separator is an empty string must convert it to undefined
   * in order for match to work
   * @type {(string | undefined) & undefined}
   */
  if (separator === '') {
    separator = undefined;
  }

  let param: string = '';
  let i = 0
  let ch = '';
  let rest: string;

  /**
   * Read characters until end or uri or till reached pathSeparator
   * and collect these chars into string.
   */
  while (ch !== undefined && ch !== URI_PATH_SEPARATOR && ch !== this.pathSeparator) {
    param += uri[i]
    ch = uri[++i]
  }

  /**
   * ch points to next char after pathParam (because of ++i)
   * so if next param does not match path separator this is considered
   * a non-match
   */
  if (ch !== separator) {

    return undefined;

  }

  rest = uri.substr(i + 1);

  return {
    param,
    rest
  }
}
