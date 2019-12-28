import { RouterErrorCode } from './errorcodes';

export class RouterError extends Error {
  constructor(public message: string, public code: RouterErrorCode) {
    super(message);
  }
}
