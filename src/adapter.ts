import { request } from "@tarojs/taro";

type requestOptions = any; //request.Option;

type SuccessCallbackResult = any; //request.SuccessCallbackResult<string>;

interface FailCallbackResult {
	errMsg: string;
}

export { request, requestOptions, SuccessCallbackResult, FailCallbackResult };
