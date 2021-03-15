import {AbstractChannel} from "~/channel/AbstractChannel";
import {IServiceInstance} from "~/service/IServiceInstance";
import {MethodPipeline} from "~/service/MethodPipeline";
import {INotificationMessage, IRequestMessage, IResponseMessage, isRequestMessage} from "~/message/message";
import {RemoteError} from "~/errors/RemoteError";

export class RequestHandler<Context> {
  protected _hasReply = false;

  public constructor(
    public readonly channel: AbstractChannel<Context>,
    public readonly instance: IServiceInstance,
    public readonly pipeline: MethodPipeline,
    public readonly message: IRequestMessage | INotificationMessage
  ) {

  }

  public async execute() {
    await this.pipeline.execute(this);
  }

  public return(result: any) {
    if (this._hasReply) throw new Error("Trying to reply to the same request more than once");
    this._hasReply = true;

    if (isRequestMessage(this.message)) {
      let response: IResponseMessage;

      if (result instanceof RemoteError) {
        response = {
          id: this.message.id,
          error: result.dehydrate(),
        };
      } else {
        response = {
          id: this.message.id,
          result,
        };
      }

      this.channel.sendMessage(response);
    }
  }
}
