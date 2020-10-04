const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const babel = require('@babel/core');
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

const moduleInfo = moduleAnalyser('./src/index.js');
console.log(moduleInfo);