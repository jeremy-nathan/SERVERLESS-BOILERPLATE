import autoBind from 'auto-bind';
import axios, { AxiosBasicCredentials } from 'axios';
import * as rax from 'retry-axios';

import { tryParseJsonString } from '../utils/helper';
import Logger from '../utils/logger';

import type { AxiosInstance, AxiosRequestConfig } from 'axios';

export default class APIService {
	private apiName: string;
	private logger: Logger;
	public apiInstance: AxiosInstance;

	constructor(apiName: string, baseUrl?: string, opts?: { headers?: any; retry?: boolean; auth?: AxiosBasicCredentials }) {
		this.apiName = apiName;
		this.logger = new Logger(`api:${this.apiName}`);
		this.apiInstance = this.create(baseUrl, opts?.headers, opts?.retry, opts?.auth);
		autoBind(this);
	}

	private create(baseUrl?: string, headers?: any, retry = false, auth?: AxiosBasicCredentials): AxiosInstance {
		const axiosRequestConfig: AxiosRequestConfig = {};

		if (baseUrl) {
			axiosRequestConfig.baseURL = baseUrl;
		}

		if (headers) {
			axiosRequestConfig.headers = headers;
		}

		if (auth) {
			axiosRequestConfig.auth = auth;
		}

		const api: AxiosInstance = axios.create(axiosRequestConfig);

		api.defaults.headers.common['Content-Type'] = 'application/json';
		api.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate, br';
		api.defaults.headers.get['Content-Type'] = 'application/json';
		api.defaults.headers.post['Content-Type'] = 'application/json';
		api.defaults.headers.put['Content-Type'] = 'application/json';
		api.defaults.headers.delete['Content-Type'] = 'application/json';

		api.interceptors.request.use(
			(config: any) => {
				// Do something before request is sent

				config.meta = config.meta || {};
				config.meta.requestTime = Date.now();
				this.logger.info(`${this.apiName} API Request`, config);
				return config;
			},
			(error) => {
				// Do something with request error
				this.logger.error(`${this.apiName} API Failed Request`, error);
				return Promise.reject(error);
			},
		);
		api.interceptors.response.use(
			(response) => {
				// Do something with response data
				const requestConfig: any = response.config;
				requestConfig.data = tryParseJsonString(requestConfig.data);
				const simplifyResponse = {
					req: requestConfig,
					status: response.status,
					headers: response.headers,
					data: response.data,
					responseTime: Date.now() - requestConfig.meta.requestTime,
				};
				this.logger.info(`${this.apiName} API Response:`, simplifyResponse);

				return response;
			},
			(error) => {
				// Do something with response error
				const requestConfig: any = error.response.config;
				requestConfig.data = tryParseJsonString(requestConfig.data);
				const result = {
					req: requestConfig,
					status: error.response.status,
					headers: error.response.headers,
					data: error.response.data,
					responseTime: Date.now() - requestConfig.meta.requestTime,
					stack: error.stack,
				};

				this.logger.error(`${this.apiName} API Failed Response:`, result);

				error.response = result;
				return Promise.reject(error);
			},
		);

		if (retry) {
			api.defaults.raxConfig = {
				instance: api,
				httpMethodsToRetry: ['GET', 'POST', 'PUT'],
				statusCodesToRetry: [
					// [100, 199],
					[400, 429],
					[500, 599],
				],
			};

			const interceptorId = rax.attach(api);
		}

		return api;
	}
}
