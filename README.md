# bundle
#### 一.安装相关依赖。
### 1.从一个index.js文件为入口文件开始读取文件内容，通过@babel/parse将code变成抽象语法树  AST
### 2.通过@babel/traverse遍历ast。找到type为 ImportDeclaration的节点。拿出其value值，分析出依赖关系。
### 3.通过@babel/preset、@babel/core进行代码转化。
### 二.生成依赖图谱, 表现形式如下。
```js
{
  './src/index.js': {
    dependencies: { './message.js': './src\\message.js' },
    code: '"use strict";\n' +
      '\n' +
      'var _message = _interopRequireDefault(require("./message.js"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj
 : { "default": obj }; }\n' +
      '\n' +
      'console.log(_message["default"]);'
  },
  './src\\message.js': {
    dependencies: { './word.js': './src\\word.js' },
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _word = require("./word.js");\n' +
      '\n' +
      'var _default = "say ".concat(_word.word);\n' +
      '\n' +
      'exports["default"] = _default;'
  },
  './src\\word.js': {
    dependencies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.word = void 0;\n' +
      "var word = 'hello';\n" +
      'exports.word = word;'
  }
}

```
## 三.拿到图谱，递归执行里面的code。
```js
const generateCode = (entry) => {
  // dependenciesGraph 是生成图谱的函数。
  const graph = JSON.stringify(dependenciesGraph(entry));
  eval(`
    (function(graph) {
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath])
        }
        let exports = {};
        (function(require, exports, code) {
          eval(code)
        })(localRequire, exports, graph[module].code)
        return exports;
      }
      require('${entry}')
    })(${graph})
  `)
}
const code = generateCode('./src/index.js');
```







