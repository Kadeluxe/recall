import {Transform, TransformCallback} from "stream";
import {FrameLengthSize} from "~/encoders/FrameStreamEncoder";

const enum State {
  ReadingSize,
  ReadingData,
}

export class FrameStreamDecoder extends Transform {
  private buffer = Buffer.alloc(0);
  private state = State.ReadingSize;
  private targetSize = 0;

  public constructor(
    public readonly maxMessageSize: number = Number.MAX_VALUE
  ) {
    super();
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      if (this.state == State.ReadingSize && this.buffer.length >= FrameLengthSize) {
        this.targetSize = this.buffer.readUInt32BE();
        if (this.targetSize > this.maxMessageSize) {
          throw new Error(`FrameStreamDecoder: message size ${this.targetSize} is above the limit ${this.maxMessageSize}`);
        }

        this.state = State.ReadingData;

        continue;
      } else if (this.state == State.ReadingData && this.buffer.length - FrameLengthSize >= this.targetSize) {
        this.push(this.buffer.slice(FrameLengthSize, FrameLengthSize + this.targetSize));

        this.buffer = this.buffer.slice(FrameLengthSize + this.targetSize);
        this.state = State.ReadingSize;

        continue;
      }

      break;
    }

    callback();
  }
}
