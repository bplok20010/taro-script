![TaroScript](https://img30.360buyimg.com/ling/jfs/t1/136920/10/9204/15335/5f543153Efeede6a9/5224a411b9d274f2.jpg)

# taro-script

**For Taro v3**：支持多端小程序动态加载远程 JavaScript 脚本并执行，**支持 ES5 语法**

## Usage

```sh
npm install --save taro-script
```

```tsx
import TaroScript from "taro-script";

<TaroScript text="console.log(100+200)" />;
```

```tsx
import TaroScript from "taro-script";

<TaroScript src="https://xxxxx/xx.js">
	<View>Hello TaroScript</View>
</TaroScript>;
```

**注 1**：同一`taro-script`只会执行一次，也就是在`componentDidMount`后执行，后续改变属性是无效的。示例

```tsx
function App({ url }) {
	// 只会在第一次创建后加载并执行，后续组件的更新会忽略所有属性变动
	return <TaroScript src={url} />;
}
```

**注 2**：多个`taro-script`会并行加载及无序执行，无法保证顺序。如：

```tsx
// 并行加载及无序执行
<TaroScript  src="url1" />
<TaroScript  src="url2" />
<TaroScript  src="url3" />
```

**如需要确保执行顺序，应该使用数组或嵌套，例如：**

**数组方式(建议)**

```tsx
<TaroScript src={["url1", "url2", "url3"]} />
```

或 嵌套方式

```tsx
<TaroScript src="url1">
	<TaroScript src="url2">
		<TaroScript src="url3"></TaroScript>
	</TaroScript>
</TaroScript>
```

## `globalContext`

内置的全局执行上下文

```tsx
import TaroScript, { globalContext } from "taro-script";

<TaroScript text="var value = 100" />;
```

**此时 `globalContext.value` 的值为 `100`**

**自定义`context`示例**

```tsx
import TaroScript from "taro-script";

const app = getApp();

<TaroScript context={app} text="var value = 100" />;
```

**此时 `app.value` 的值为 `100`**

## `TaroScript` 属性

- ### `src`

  类型：`string | string[]`

  要加载的远程脚本

- ### `text`

  类型：`string | string[]`

  需要执行的 JavaScript 脚本字符串，`text` 优先级高于 `src`

- ### `context`

  类型：`object`

  默认值：`globalContext = {}`

  执行上下文，默认为`globalContext`

- ### `timeout`

  类型：`number`
  默认值：`10000` 毫秒

  设置每个远程脚本加载超时时间

- ### `onExecSuccess`

  类型：`()=> void`

  脚本执行成功后回调

- ### `onExecError`

  类型：`(err:Error)=> void`

  脚本执行错误后回调

- ### `onLoad`

  类型：`() => void`

  脚本加载完且执行成功后回调，`text`存在时无效

- ### `onError`

  类型：`(err: Error) => void`

  脚本加载失败或脚本执行错误后回调，`text`存在时无效

- ### `fallback`

  类型：`React.ReactNode`

  脚本加载中、加载失败、执行失败的显示内容

- ### `cache`

  类型：`boolean`

  默认值：`true`

  是否启用加载缓存，缓存策略是已当前请求地址作为`key`，缓存周期为当前用户在使用应用程序的生命周期。

- ### `children`

  类型：`React.ReactNode | ((context: T) => React.ReactNode)`

  加载完成后显示的内容，支持传入`函数`第一个参数为脚本执行的`上下文`

## `useScriptContext()`

获取当前执行上下文 hook

```tsx
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

```tsx
import { evalScript } from "taro-script";

const value = evalScript("100+200"); // 300
```

## 其他

- 该组件使用[eval5](https://github.com/bplok20010/eval5)来解析`JavaScript`语法，支持 `ES5`

- **上生产环境前别忘记给需要加载的地址配置合法域名**

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
```

> 内置类型和当前运行 JavaScript 环境相关，如环境本身不支持则不支持！

导入自定义方法或类型示例：

```tsx
import TaroScript, { globalContext } from "taro-script";

globalContext.hello = function(){
  console.log('hello taro-script')
}

<TaroScript text="hello()"></TaroScript>;
```

或自定义上下文

```tsx
import TaroScript from "taro-script";

const ctx = {
  hello(){
    console.log('hello taro-script')
  }
}

<TaroScript context={ctx} text="hello()"></TaroScript>;

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
	onLoad?: () => void;
	/** 脚本加载失败后回调 */
	onError?: (err: Error) => void;
	onExecSuccess?: () => void;
	onExecError?: (err: Error) => void;
	/** 加载脚本超时时间 */
	timeout?: number;
	/** 脚本加载中显示内容 */
	fallback?: React.ReactNode;
	/** 启用缓存 */
	cache?: boolean;
	children?: React.ReactNode | ((context: T) => React.ReactNode);
}

declare function evalScript<T extends Record<any, any>>(code: string, context?: T): any;

declare const globalContext: {};
declare function useScriptContext<T = Record<any, any>>(): T;
```
