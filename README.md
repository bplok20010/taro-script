# taro-script

For Taro v3：支持多端小程序动态加载远程 JavaScript 脚本并执行，**当前 JavaScript 解释器只支持 ES5 语法**

## Usage

```sh
npm install --save taro-script
```

```ts
import TaroScript from "taro-script";

<TaroScript text="console.log(100+200)" />;
```

```ts
import TaroScript from "taro-script";

<TaroScript context={getApp()} src="https://xxxxx/xx.js">
	<View>Taro Script</View>
</TaroScript>;
```

## globalContext

内置的全局执行上下文

```ts
import TaroScript, { globalContext } from "taro-script";

<TaroScript text="var value = 100" />;
```

**此时 `globalContext.value` 的值为 `100`**

## TaroScript 属性

### `src`

类型：`string | string[]`

要加载的远程脚本

### `text`

类型：`string | string[]`

需要执行的 JavaScript 脚本字符串，`text` 优先级高于 `src`

### `context`

类型：`object`

默认值：`globalContext = {}`

执行上下文，默认为`globalContext`，可通过`import {globalContext} from 'taro-script'`获取

```ts
<TaroScript context={getApp()} />
```

### `timeout`

类型：`number`
默认值：`10000` 毫秒

设置每个远程脚本加载超时时间

### `onExecSuccess`

类型：`()=> void`

脚本执行成功后回调

### `onExecError`

类型：`(err:Error)=> void`

脚本执行错误后回调

### `onLoad`

类型：`(props: TaroScriptProps) => void`

脚本加载完且执行成功后回调

### `onError`

类型：`(err: Error,props: TaroScriptProps) => void`

脚本加载失败或脚本执行错误后回调

### `fallback`

类型：`React.ReactNode`

脚本加载中、加载失败、执行失败的显示内容

### `useCache`

类型：`boolean`

默认值：`true`

是否启用加载缓存

### `children`

类型：`React.ReactNode | ((context: T) => React.ReactNode)`

加载完成后显示的内容，支持传入`函数`第一个参数为脚本执行的`作用域`

## `useScriptContext()`

获取当前执行上下文 hook

```ts
import TaroScript, { useScriptContext } from "taro-script";

<TaroScript text="var a= 100">
	<Test />
</TaroScript>;

function Test() {
	const ctx = useScriptContext();
	return ctx.a; // 100
}
```

## `evalScript(code: string, context?: {})`

动态执行给定的字符串脚本，并返回最后一个表达式的值

```ts
import { evalScript } from "taro-script";

evalScript("100+200");
```

## Interface

```ts
interface TaroScriptProps<T = Record<any, any>> {
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
	/** 启用缓存 */
	useCache?: boolean;
	children?: React.ReactNode | ((context: T) => React.ReactNode);
}

declare function evalScript<T extends Record<any, any>>(code: string, context?: T): any;

declare const globalContext: {};
```

## 其他

- 该组件使用[eval5](https://github.com/bplok20010/eval5)来解析`JavaScript`

- TaroScript 内置类型及方法：

```ts
  NaN,
	Infinity,
	undefined,
	null,
	Object,
	Array,
	String,
	Boolean,
	Number,
	Date,
	RegExp,
	Error,
	URIError,
	TypeError,
	RangeError,
	SyntaxError,
	ReferenceError,
	Math,
	parseInt,
	parseFloat,
	isNaN,
	isFinite,
	decodeURI,
	decodeURIComponent,
	encodeURI,
	encodeURIComponent,
	escape,
	unescape,
	eval,
  Function,
  console,
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	requestAnimationFrame,
	cancelAnimationFrame,
```

> 内置类型和当前运行 JavaScript 环境相关，如环境本身不支持则不支持！

导入自定义方法或类型示例：

```ts
import TaroScript, { globalContext } from "taro-script";

globalContext.hello = function(){
  console.log('hello taro-script')
}

<TaroScript text="hello()"></TaroScript>;
```

或

```ts
import TaroScript, { globalContext } from "taro-script";

const ctx = {
  hello(){
    console.log('hello taro-script')
  }
}

<TaroScript context={ctx} text="hello()"></TaroScript>;

```
