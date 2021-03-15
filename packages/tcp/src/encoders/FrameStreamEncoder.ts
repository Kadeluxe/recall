import {Transform, TransformCallback} from "stream";

export const FrameLengthSize = 4;

export class FrameStreamEncoder extends Transform {
  private readonly lengthBuffer = Buffer.allocUnsafe(FrameLengthSize);

  public constructor() {
    super();
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    this.lengthBuffer.writeUInt32BE(chunk.length);
    this.push(this.lengthBuffer);
    this.push(chunk);
    callback();
  }
}
