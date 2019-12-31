import { IExtractedPathParam } from '../interfaces';

export default class ExtractedPathParam implements IExtractedPathParam {
  public readonly paramName: string;

  public readonly paramValue: string;

  constructor(paramName: string, paramValue: string) {
    this.paramName = paramName;
    this.paramValue = paramValue;
  }
}
