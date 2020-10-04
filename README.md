# bundle

## 一.从一个index.js 入口文件开始。然后读取内容。
## 二.从内容中分析其依赖关系。（找到import的内容）
### 1.通过（@babel/parser）将code变成 抽象语法树。AST
### 2.通过ast（js对象），获取从中type值为importDecleartion的Node节点。
### 3.遍历body对象，找到 type为importDeclaration的node节点。