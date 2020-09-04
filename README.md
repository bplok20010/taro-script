# taro-script

For Taro v3：支持多端小程序动态加载 script

## Usage

```
npm install --save taro-script
```

```ts
import TaroScript from "taro-script";
import app from "../app";

<TaroScript ctx={app} src="https://xxxxx/xx.js" onLoad={onload} />;
```

```ts
import TaroScript from "taro-script";
import app from "../app";

<TaroScript ctx={app} src="https://xxxxx/xx.js">
	<View>Taro Script</View>
</TaroScript>;
```

## Interface

```ts
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
```
