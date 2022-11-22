# mini-vite实现


## 依赖预构建

**依赖预构建**的逻辑实现:`src/node/optimizer`

### 自动依赖搜寻
如果没有找到相应的缓存，Vite 将抓取你的源码，并自动寻找引入的依赖项（即 "bare import"，表示期望从 node_modules 解析），并将这些依赖项作为预构建包的入口点。预构建通过 esbuild 执行，所以它通常非常快。
在服务器已经启动之后，如果遇到一个新的依赖关系导入，而这个依赖关系还没有在缓存中，Vite 将重新运行依赖构建进程并重新加载页面。

### 构建代理模块

通过`es-module-lexer`分析入口文件以及对应关联模块的`import/export`语句

```javascript
const code = await fs.readFile(entryPath, "utf-8");
const [imports, exports] = await parse(code);
let proxyModule = [];
```

- 若分析结果中既无`import`也无`export`语句，则说明此文件模块为`cjs`格式，则通过`require`直接导入并提取该模块对外导出的方法、属性

```javascript
// code...
const res = require(entryPath);
const specifiers = Object.keys(res);
proxyModule.push(
    `export { ${specifiers.join(",")} } from "${entryPath}"`,
    `export default require("${entryPath}")`
);
```

- 若分析结果中存在`import`or`export`语句，则说明文件模块为`esm`格式，则

```javascript
// code...
if (exports.includes("default" as any)) {
    proxyModule.push(`import d from "${entryPath}";export default d`);
}
proxyModule.push(`export * from "${entryPath}"`);
```

经过上述过程我们便得到了代理模块数组`proxyModule`，可见数组每一个元素都是一条导入导出语句，只需要将数组转换成字符串并传递给esbuild的buildAPI即可进行`依赖预构建`




## 依赖说明

tsup：能够实现库打包的功能，并且内置 esbuild 进行提速，性能上更加强悍，因此在这里我们使用 tsup 进行项目的构建