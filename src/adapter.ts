import { request } from "@tarojs/taro";

type requestOptions = request.Option;

type SuccessCallbackResult = request.SuccessCallbackResult<string>;

interface FailCallbackResult {
	errMsg: string;
}

export { request, requestOptions, SuccessCallbackResult, FailCallbackResult };
