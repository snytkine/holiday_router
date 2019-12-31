import RouterErrorCode from './errorcodes';

export default class RouterError extends Error {
  constructor(public message: string, public code: RouterErrorCode) {
    super(message);
  }
}
