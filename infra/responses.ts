export interface IResponse<T> {
  status_code: number;
  data?: T;
  error: boolean;
  message?: string;
  action?: string;
}

export class Response<T> implements IResponse<T> {
  status_code: number;
  data?: T;
  error: boolean;
  message?: string;
  action?: string;

  constructor({ status_code, data, error, message, action }: IResponse<T>) {
    this.error = error ?? false;
    this.status_code = status_code;
    this.data = data;
    this.message = message;
    this.action = action;
  }
}
