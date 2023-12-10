export class ErrorCode {
  static readonly GENERIC = new ErrorCode("IOTPC9999", "Something went wrong");

  //to add, just increment the error code

  readonly code: string;
  readonly message: string;

  private constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}
