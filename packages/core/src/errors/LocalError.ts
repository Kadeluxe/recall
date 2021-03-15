import {CustomError} from "ts-custom-error";

export class LocalError extends CustomError {
  public static readonly Timeout = 0;
  public static readonly Reset = 1;

  private static _messages = [
    "Remote call failed due to the timeout",
    "Connection reset",
  ];

  public constructor(
    public readonly code: number,
    public readonly service: string,
    public readonly method: string,
  ) {
    super(LocalError._messages[code]);
  }
}
