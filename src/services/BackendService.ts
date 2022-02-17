import LoggerFactory from "@/logger/LoggerFactory";
import TimeUtil from "@/utils/TimeUtil";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

type HttpMethod =
  | "get"
  | "delete"
  | "head"
  | "options"
  | "post"
  | "put"
  | "patch"
  | "link"
  | "unlink"
  | "GET"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "POST"
  | "PUT"
  | "PATCH"
  | "LINK"
  | "UNLINK"
  | undefined;

type ResponseType =
  | "json"
  | "arraybuffer"
  | "blob"
  | "document"
  | "text"
  | "stream"
  | undefined;

export abstract class WebService {
  logger = LoggerFactory.getLogger("Services.BackendService");

  private _url = "";
  private _method: HttpMethod = undefined;
  private _headers: any = {};
  private _responseType: ResponseType = "json";

  private _requestSerializer(request: any | undefined): any {
    if (request == undefined) {
      return undefined;
    }
    return JSON.stringify(request);
  }

  public url(url: string): WebService {
    this._url = url;
    return this;
  }
  public header(name: string, value: string): WebService {
    this._headers[name] = value;
    return this;
  }
  public responseType(responseType: ResponseType): WebService {
    this._responseType = responseType;
    return this;
  }
  public jsonRequest(): WebService {
    this.header("Content-Type", "application/json; charset=utf-8");
    return this;
  }
  public method(method: HttpMethod): WebService {
    this._method = method;
    return this;
  }
  public get(): WebService {
    return this.method("get");
  }
  public delete(): WebService {
    return this.method("delete");
  }
  public post(): WebService {
    return this.method("post");
  }
  public put(): WebService {
    return this.method("put");
  }
  public patch(): WebService {
    return this.method("patch");
  }
  protected abstract auth(): Promise<void>;

  public requestSerializer(serializer: (request: any) => any): WebService {
    this._requestSerializer = serializer;
    return this;
  }

  public async call(payload: any | undefined = undefined): Promise<any> {
    const startTime = TimeUtil.timestamp();
    const instance = axios.create();

    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      return config;
    });
    instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        const duration = Math.round(TimeUtil.timestamp() - startTime);
        this.logger.info(
          `WS_CALL_DONE url=${response.config.url} time_taken=${duration} status=${response.status} status_mesage=${response.statusText}`
        );
        return response;
      },
      (error: any) => {
        const duration = Math.round(TimeUtil.timestamp() - startTime);
        this.logger.error(
          `WS_CALL_DONE url=${error.config.url} time_taken=${duration} status=${error.status} status_mesage=${error.statusText}`
        );
        throw { data: error.response.data };
      }
    );

    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      return config;
    });

    instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        return response;
      },
      (error: any) => {
        throw error;
      }
    );
    const serializedPayload = this._requestSerializer(payload);
    await this.auth();
    return this.executeCall(instance, {
      url: this._url,
      method: this._method,
      headers: this._headers,
      responseType: this._responseType,
      data: serializedPayload,
    });
  }

  protected async executeCall(
    axiosInstance: AxiosInstance,
    request: AxiosRequestConfig
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      axiosInstance(request)
        .then((data) => resolve(data))
        .catch(reject);
    });
  }
}

export class BackendWebService extends WebService {
  public static url(resource: string): BackendWebService {
    const service = new BackendWebService();
    service.url(resource);
    return service;
  }

  protected async auth(): Promise<void> {
    return;
  }
}
