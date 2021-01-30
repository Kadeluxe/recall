import {AnySchema} from "joi";
import {IRecallException} from "@recall/shared/types";

export function checkArgs(...rules: AnySchema[]) {
  return function (this: any, args: any[]) {
    if (args.length != rules.length) {
      throw <IRecallException>{
        message: `Invalid call: number of args doesn't match number of validation rules`,
        code: 400,
      };
    }

    const results = args.map((arg, idx) => rules[idx].validate(arg));
    results.forEach(({error}, idx) => {
      if (error != undefined) {
        throw <IRecallException>{
          message: `Invalid call: arg #${idx}: ${error.message}`,
          data: error.details,
          code: 400,
        };
      }
    });
  };
}