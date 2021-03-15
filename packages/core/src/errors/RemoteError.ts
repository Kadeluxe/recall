import {CustomError} from "ts-custom-error";
import {IRemoteError} from "~/message/message";

export class RemoteError extends CustomError implements IRemoteError {
  public static readonly InvalidArgs = 0;
  private static _messages = [
    "Remote service rejected provided arguments"
  ];

  public constructor(
    public readonly code: number,
    public readonly service: string,
    public readonly method: string,
  ) {
    super(RemoteError._messages[code]);
  }

  public dehydrate() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
