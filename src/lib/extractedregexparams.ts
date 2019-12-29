import { IRegexParams } from '../interfaces';

export default class RegexParams implements IRegexParams {
  constructor(public readonly paramName: string, public readonly params: Array<string>) {}
}
