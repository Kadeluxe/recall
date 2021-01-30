import {NextFunction, Request, Response} from "express";
import {TRecallServerOptions} from "@recall/shared/types";
import {Recall} from "@recall/shared/recall";
import {TEndpointTable} from "@recall/shared/endpoints";

export function recall<TContext>(endpoints: TEndpointTable, options: TRecallServerOptions<TContext>) {
  const recall = new Recall(endpoints);

  return async function (req: Request, res: Response, next: NextFunction) {
    if (req.method != "POST") {
      res.status(405);
      return;
    }

    const body = <unknown>req.body;
    if (body == undefined || !Array.isArray(body)) {
      throw new Error(`Wrong body`);
    }

    const [path, args] = body;

    if (typeof path !== "string") {
      throw new Error(`Incorrect path type`);
    }

    if (!Array.isArray(args)) {
      throw new Error(`Incorrect args type`);
    }

    const context = options.context !== undefined ? await options.context(req, res) : <TContext>{};
    const result = await recall.callLocalEndpoint(path, args, context);

    if (result.exception && result.exception.code != undefined) {
      res.status(result.exception.code);
    }

    res.json(result);
  };
}