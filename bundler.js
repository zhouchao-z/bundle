const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const babel = require('@babel/core');

//入口文件的分析。
const moduleAnalyser = (filename) => {
  const content = fs.readFileSync(filename, 'utf-8');
  
  const ast = parser.parse(content, { 
    sourceType: 'module',
  })
  // 通过traverse遍历body，找到type为ImportDeclaration的节点。
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      // console.log(node.source.value);
      // 拼接路径 
      const dirname = path.dirname(filename);
      const oldFile = node.source.value;
      const newFile = './' + path.join(dirname, oldFile);
      dependencies[oldFile] = newFile;
    }
  })
  //编译代码，转化为浏览器可以识别的代码。
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })
  return {
    filename,
    dependencies,
    code
  }
}

// 依赖图谱，包含所有的依赖关系。
const dependenciesGraph = (filename) => {
  const entryModule = moduleAnalyser(filename);
  const graphArr = [entryModule];

  for(let i = 0; i < graphArr.length; i++) {
    const item = graphArr[i];
    const { dependencies } = item;
    if(dependencies) {
      for(let i in dependencies) {
        graphArr.push(moduleAnalyser(dependencies[i]))
      }
    }
  }
  const graph = {};
  graphArr.forEach(item => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code
    }
  }) 
  return graph;
}


// 递归执行依赖图谱里面的code。  
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
