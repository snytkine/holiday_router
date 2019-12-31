import { IRegexParams } from '../interfaces';

export default class RegexParams implements IRegexParams {
  public readonly paramName: string;

  public readonly params: Array<string>;

  constructor(paramName: string, params: Array<string>) {
    this.paramName = paramName;
    this.params = params;
  }
}
