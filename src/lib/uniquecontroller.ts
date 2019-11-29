import { IController } from '../interfaces'

export class UniqueController<T> implements IController {

  constructor(public controller: T, public id: string = 'UniqueController') {
  }

  /**
   * To make a contoller unique it must
   * return true here. This will make it impossible
   * to add 2 of these controllers to the same node.
   * @param controller
   */
  public equals(other: IController): boolean {
    return true;
  }

  get priority() {
    return 1;
  }

}



export class UniqueStringController implements IController {

  constructor(public controller: string) {
  }

  get id(){
    return `UniqueStringController::${this.controller}`
  }


  public equals(other: IController): boolean {
    return other instanceof UniqueStringController && other.controller === this.controller;
  }

  get priority() {
    return 1;
  }

}

