import {RemoteError, RequestHandler, TNextFunction, TServiceMethodMiddlewareFunction} from "@kadeluxe/recall-core";
import Joi from "joi";

export function args(...args: Joi.AnySchema[]): TServiceMethodMiddlewareFunction {
  const schema = Joi.array().items(...args.map(it => it.required()));

  return async (req: RequestHandler<any>, next: TNextFunction) => {
    const {service, method, params} = req.message;

    const {error, value} = schema.validate(params);
    if (error !== undefined) {
      req.return(new RemoteError(RemoteError.InvalidArgs, service, method));
      return;
    }

    req.message.params = value;
    await next();
  };
}
