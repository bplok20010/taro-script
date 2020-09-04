import React from "react";
import { request } from "@tarojs/taro";
import { Interpreter } from "eval5";

const PENDING = 0;
const COMPLETED = 1;

const SCRIPT_EXEC_TIMEOUT = 600000;

export interface TaroScriptProps {
	/** 脚本执行的上下文环境，必填 */
	context: Record<any, any>;
	/** 脚本路径 */
	src?: string;
	/** 脚本加载并执行完后回调 */
	onLoad?: (props: TaroScriptProps) => void;
	/** 脚本加载失败后回调 */
	onError?: (err: Error, props: TaroScriptProps) => void;
	/** 加载脚本超时时间 */
	timeout?: number;
	/** 脚本加载中显示内容 */
	fallback?: React.ReactNode;
}

export const TaroScript: React.FC<TaroScriptProps> = function TaroScript(props) {
	const result = React.useState<typeof PENDING | typeof COMPLETED>(PENDING);
	const loadStatus = result[0],
		setLoadStatus = result[1];

	React.useEffect(() => {
		const { src, context, timeout, onLoad, onError } = props;
		if (!src) {
			return;
		}

		request({
			url: src,
			timeout,
			method: "GET",
		})
			.then((res) => {
				const scriptText = res.data;

				if (scriptText) {
					const interpreter = new Interpreter(context, { timeout: SCRIPT_EXEC_TIMEOUT });
					interpreter.evaluate(scriptText);
				}

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
};

TaroScript.displayName = "TaroScript";

TaroScript.defaultProps = {
	context: Object.create(null),
};

export default TaroScript;
