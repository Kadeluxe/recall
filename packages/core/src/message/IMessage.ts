export const enum MessageType {
  Invoke,
  Response,
}

export const enum MessageFlags {
  Volatile = 1 << 0,
}

type MessageId = number;
type InvokePath = string;
type InvokeArgs = any[];

type Error = any;
type Data = any;

export type ResponseData = [Error, Data];

export type IMessageInvoke = [MessageType.Invoke, MessageId, InvokePath, InvokeArgs, MessageFlags];
export type IMessageResponse = [MessageType.Response, MessageId, ResponseData, MessageFlags];

type BasicSchema = ((input: any) => boolean)[];

const invokeSchema: BasicSchema = [
  (type: any) => type === MessageType.Invoke,
  (id: any) => id === parseInt(id),
  (path: any) => typeof path == "string" && path.length > 0,
  (args: any) => Array.isArray(args),
  (flags: any) => flags === parseInt(flags),
];

const responseSchema: BasicSchema = [
  (type: any) => type === MessageType.Response,
  (id: any) => id === parseInt(id),
  (data: any) => Array.isArray(data) && data.length == 2,
  (flags: any) => flags === parseInt(flags),
];

function validateSchema(input: any[], schema: BasicSchema) {
  if (!Array.isArray(input)) return false;
  if (input.length != schema.length) return false;
  
  return input.every((value, idx) => schema[idx](value));
}

export function isInvokeMessage(message: any[]): message is IMessageInvoke {
  const [type] = message;
  return type == MessageType.Invoke && validateSchema(message, invokeSchema);
}

export function isResponseMessage(message: any[]): message is IMessageResponse {
  const [type] = message;
  return type == MessageType.Response && validateSchema(message, responseSchema);
}
