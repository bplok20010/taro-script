import React from "react";
import { globalContext, evalScript, loadScript } from "./utils";

export { evalScript, globalContext };

const PENDING = 0;
const COMPLETED = 1;

const ScriptContext = React.createContext({
	context: globalContext,
});

export const version = "%VERSION%";

export interface TaroScriptProps<T = Record<any, any>> {
	/** 脚本执行根作用域及上下文环境 */
	context?: T;
	/** 脚本路径 */
	src?: string | string[];
	/** JavaScript字符串代码 */
	text?: string;
	/** 脚本加载并执行完后回调 */
	onLoad?: () => void;
	/** 脚本加载失败后回调 */
	onError?: (err: Error) => void;
	onExecSuccess?: () => void;
	onExecError?: (err: Error) => void;
	/** 加载脚本超时时间 */
	timeout?: number;
	/** 脚本加载中显示内容 */
	fallback?: React.ReactNode;
	/** 使用加载缓存 */
	cache?: boolean;
	/** 预留 */
	type?: string;
	children?: React.ReactNode | ((context: T) => React.ReactNode);
}

export function useScriptContext<T = Record<any, any>>(): T {
	return React.useContext(ScriptContext).context;
}

export function TaroScript<T = Record<any, any>>(props: TaroScriptProps<T>) {
	const contextRef = React.useRef(props.context || globalContext);
	const result = React.useState<typeof PENDING | typeof COMPLETED>(PENDING);
	const loadStatus = result[0],
		setLoadStatus = result[1];

	React.useEffect(() => {
		const context = contextRef.current;
		const { src, timeout, onLoad, onError, onExecError, onExecSuccess, cache, text } = props;

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
				{
					url,
					timeout,
					mode: "cors",
					credentials: "include",
					method: "GET",
				},
				cache
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
						onLoad();
					}

					setLoadStatus(COMPLETED);
				} else {
					throw execErr;
				}
			})
			.catch((err) => {
				if (onError) {
					onError(err);
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
	cache: true,
	children: null,
	fallback: null,
};

export default TaroScript;
