export class Serializer {
  public static serialize(data: any) {
    return JSON.stringify(data);
  }
  
  public static deserialize(input: string) {
    return JSON.parse(input);
  }
}
