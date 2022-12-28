import { parseHTML } from "./parse";
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key.trim()] = value.trim();
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{asdsadsa}匹配到的内容就是我们表达式的变量
function gen(node) {
  // 标签
  if (node.type === 1) {
    return codegen(node);
  }
  // 文本
  else {
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      let tokens = [];
      let match;
      let lastIndex = 0;
      defaultTagRE.lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}
function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}
function codegen(ast) {
  let children = genChildren(ast.children);
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : "null"
  }${ast.children.length ? `,${children}` : ""})`;
  return code;
}

// 对模版进行编译处理
export function compileToFunction(template) {
  // 1.将 template 转化成 ast 语法树
  let ast = parseHTML(template);

  // 2.生成render方法，（render方法执行后的返回结果就是虚拟DOM）

  // 模版引擎的实现原理---with + new Function
  let code = codegen(ast);
  // _c('div',{id:"app",style:{"color":" red"," font-size":" 20px"}},_c('div',{class:"box"},_v("a"+_s(name)+"b")),_c('div',null,_v(_s(age))),_c('input',{type:"text"}))
  code = `with(this){return ${code}}`;
  let render = new Function(code); // 根据代码生成render函数

  return render;
}
