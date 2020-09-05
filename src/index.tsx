import React from "react";
import { request } from "@tarojs/taro";
import { Interpreter } from "eval5";

const PENDING = 0;
const COMPLETED = 1;

const SCRIPT_EXEC_TIMEOUT = 600000;

// 基本方法注入
const rootContext = {
	console,
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	requestAnimationFrame,
	cancelAnimationFrame,
};

export const globalScope = {};

export const version = "%VERSION%";

function wrapScope<T extends Record<any, any>>(
	scope: T
): T & {
	__loadCache: {};
} {
	if (!scope.__loadCache) {
		Object.defineProperty(scope, "__loadCache", {
			value: Object.create(null),
			enumerable: false,
		});
	}
	return scope as any;
}

export interface TaroScriptProps<T = Record<any, any>> {
	/** 脚本执行根作用域及上下文环境 */
	scope?: T;
	/** 脚本路径 */
	src?: string | string[];
	/** 脚本加载并执行完后回调 */
	onLoad?: (props: TaroScriptProps) => void;
	/** 脚本加载失败后回调 */
	onError?: (err: Error, props: TaroScriptProps) => void;
	/** 加载脚本超时时间 */
	timeout?: number;
	/** 脚本加载中显示内容 */
	fallback?: React.ReactNode;
	useCache?: boolean;
	children?: React.ReactNode | ((scope: T) => React.ReactNode);
}

function evalScript<T>(scope: T, code: string) {
	if (!code) return;

	const interpreter = new Interpreter(scope, {
		timeout: SCRIPT_EXEC_TIMEOUT,
		rootContext: rootContext,
		globalContextInFunction: scope,
	});

	interpreter.evaluate(code);
}

function loadScript<
	T extends {
		__loadCache: {};
	}
>(scope: T, requestOpts: request.Option, useCache = true) {
	const url = requestOpts.url;

	return new Promise<string>((resolve, reject) => {
		if (useCache && url in scope.__loadCache) {
			resolve(scope.__loadCache[url]);
			return;
		}

		request(
			Object.assign({}, requestOpts, {
				success(res: request.SuccessCallbackResult<string>) {
					resolve((scope.__loadCache[url] = res.data));
				},
				fail(err: { errMsg: string }) {
					reject(new Error(err.errMsg));
				},
			})
		);
	});
}

export function TaroScript<T = Record<any, any>>(props: TaroScriptProps<T>) {
	const scopeRef = React.useRef(wrapScope(props.scope || globalScope));
	const result = React.useState<typeof PENDING | typeof COMPLETED>(PENDING);
	const loadStatus = result[0],
		setLoadStatus = result[1];

	React.useEffect(() => {
		const scope = scopeRef.current;
		const { src, timeout, onLoad, onError, useCache } = props;
		if (!src) {
			return;
		}

		const scriptUrls = Array.isArray(src) ? src : [src];

		const promises = scriptUrls.map((url) => {
			return loadScript(
				scope,
				{
					url,
					timeout,
					mode: "cors",
					credentials: "include",
					method: "GET",
				},
				useCache
			);
		});

		Promise.all(promises)
			.then((codes) => {
				codes.forEach((code) => {
					evalScript(scope, code);
				});

				if (onLoad) {
					onLoad(props);
				}

				setLoadStatus(COMPLETED);
			})
			.catch((err) => {
				if (onError) {
					onError(err, props);
				}
			});
	}, []);

	return (loadStatus === COMPLETED ? props.children : props.fallback) as React.ReactElement;
}

TaroScript.displayName = "TaroScript";

TaroScript.defaultProps = {
	useCache: true,
	children: null,
	fallback: null,
};

export default TaroScript;
