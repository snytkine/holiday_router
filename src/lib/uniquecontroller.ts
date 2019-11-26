import { IController } from '../interfaces'

const TAG = 'UniqueController';

export class UniqueController<T> implements IController {

  constructor(public value: T, public id: string = TAG) {
  }

  public equals(controller: IController): boolean {
    return false;
  }

  get priority() {
    return 1;
  }

}
