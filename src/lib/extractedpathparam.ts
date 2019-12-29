import { IExtractedPathParam } from '../interfaces';

export default class ExtractedPathParam implements IExtractedPathParam {
  constructor(public readonly paramName: string, public readonly paramValue: string) {}
}
