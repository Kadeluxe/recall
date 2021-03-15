import {ISender} from "@recall/core";

export abstract class AbstractRemote implements ISender {
  protected counter: number = 0;
  
  public getNextCounter() {
    return this.counter++;
  }
  
  public abstract send(data: any): void;
}
