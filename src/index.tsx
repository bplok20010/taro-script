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

export const globalContext: Record<any, any> = {};

const ScriptContext = React.createContext({
	context: globalContext,
});

export const version = "%VERSION%";

function wrapContext<T extends Record<any, any>>(
	context: T
): T & {
	__loadCache: {};
} {
	if (!context.__loadCache) {
		Object.defineProperty(context, "__loadCache", {
			value: Object.create(null),
			enumerable: false,
		});
	}
	return context as any;
}

export interface TaroScriptProps<T = Record<any, any>> {
	/** 脚本执行根作用域及上下文环境 */
	context?: T;
	/** 脚本路径 */
	src?: string | string[];
	/** JavaScript字符串代码 */
	text?: string;
	/** 脚本加载并执行完后回调 */
	onLoad?: (props: TaroScriptProps) => void;
	/** 脚本加载失败后回调 */
	onError?: (err: Error, props: TaroScriptProps) => void;
	onExecSuccess?: () => void;
	onExecError?: (err: Error) => void;
	/** 加载脚本超时时间 */
	timeout?: number;
	/** 脚本加载中显示内容 */
	fallback?: React.ReactNode;
	useCache?: boolean;
	/** 预留 */
	type?: string;
	children?: React.ReactNode | ((context: T) => React.ReactNode);
}

export function evalScript<T extends Record<any, any>>(code: string, context?: T) {
	if (!code) return;

	const interpreter = new Interpreter(context || globalContext, {
		timeout: SCRIPT_EXEC_TIMEOUT,
		rootContext: rootContext,
		globalContextInFunction: context || globalContext,
	});

	interpreter.evaluate(code);

	return interpreter.getValue();
}

function loadScript<
	T extends {
		__loadCache: {};
	}
>(context: T, requestOpts: request.Option, useCache = true) {
	const url = requestOpts.url;

	return new Promise<string>((resolve, reject) => {
		if (useCache && url in context.__loadCache) {
			resolve(context.__loadCache[url]);
			return;
		}

		request(
			Object.assign({}, requestOpts, {
				success(res: request.SuccessCallbackResult<string>) {
					resolve((context.__loadCache[url] = res.data));
				},
				fail(err: { errMsg: string }) {
					reject(new Error(err.errMsg));
				},
			})
		);
	});
}

export function useScriptContext<T = Record<any, any>>(): T {
	return React.useContext(ScriptContext).context;
}

export function TaroScript<T = Record<any, any>>(props: TaroScriptProps<T>) {
	const contextRef = React.useRef(wrapContext(props.context || globalContext));
	const result = React.useState<typeof PENDING | typeof COMPLETED>(PENDING);
	const loadStatus = result[0],
		setLoadStatus = result[1];

	React.useEffect(() => {
		const context = contextRef.current;
		const { src, timeout, onLoad, onError, onExecError, onExecSuccess, useCache, text } = props;

		if (text) {
			try {
				evalScript(text, context);

				if (onExecSuccess) {
					onExecSuccess();
				}

				setLoadStatus(COMPLETED);
			} catch (e) {
				if (onExecError) {
					onExecError(e);
				}
			}
			return;
		}

		if (!src) {
			return;
		}

		const scriptUrls = Array.isArray(src) ? src : [src];

		const promises = scriptUrls.map((url) => {
			return loadScript(
				context,
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
				let execErr: Error | null = null;
				try {
					codes.forEach((code) => {
						evalScript(code, context);
					});
				} catch (e) {
					execErr = e;
					if (onExecError) {
						onExecError(e);
					}
				}

				if (!execErr) {
					if (onExecSuccess) {
						onExecSuccess();
					}

					if (onLoad) {
						onLoad(props);
					}

					setLoadStatus(COMPLETED);
				} else {
					throw execErr;
				}
			})
			.catch((err) => {
				if (onError) {
					onError(err, props);
				}
			});
	}, []);

	return (
		<ScriptContext.Provider
			value={{
				context: contextRef.current,
			}}
		>
			{loadStatus === COMPLETED
				? typeof props.children === "function"
					? props.children(contextRef.current)
					: props.children
				: props.fallback}
		</ScriptContext.Provider>
	);
}

TaroScript.displayName = "TaroScript";

TaroScript.defaultProps = {
	timeout: 10000,
	useCache: true,
	children: null,
	fallback: null,
};

export default TaroScript;
