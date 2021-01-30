import {Request, Response} from "express";

export type TRecallServerOptions<TContext> = {
  context?: (req: Request, res: Response) => Promise<TContext>;
}

export interface IRecallException {
  isNetworkError: boolean;
  isRemoteError: boolean;
  message?: string;
  data?: any;
  code?: number;
}

export interface IRecallResponse {
  returnData?: any;
  exception?: IRecallException;
}