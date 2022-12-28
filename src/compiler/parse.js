const ncname = `[a-z A-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配到的分组是一个标签名<xxx匹配到的是开始标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配的是</xxxx>最终匹配到的分组就是结束标签的名字
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性 //第一个分组就是属性的key value就是分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/; //<div><br/>


export function parseHTML(html) {
  const ELEMENT_TYPE = 1; // 元素类型
  const TEXT_TYPE = 3; // 文本类型
  const stack = []; // 栈，存放元素
  let currentParent; // 指向栈的最后一个元素
  let root; //根节点

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  function start(tag, attrs) {
    console.log("开始标签", tag, attrs);

    let node = createASTElement(tag, attrs); // 创建一个ast节点
    if (!root) {
      // 如果是空树，则当前节点为树的根节点
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent; // 指定当前元素的父元素
      currentParent.children.push(node); // 添进父元素的children里
    }
    stack.push(node);
    currentParent = node; // 更新 父元素
  }
  function chars(text) {
    console.log("文本内容", text);
    // 文本直接放到当前指向的节点
    text = text.replace(/\s/g, "");
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }
  function end(tag) {
    console.log("结束标签", tag);
    stack.pop(); // 删除最后一个元素
    currentParent = stack[stack.length - 1]; // 更新 父元素
  }

  // 逐个匹配，删除匹配过的字符
  function advance(n) {
    html = html.substring(n);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false; // 不是开始标签
  }
  while (html) {
    // 如果textEnd === 0 说明是一个开始标签或者结束标签
    // 如果textEnd > 0 说明就是文本的结束位置
    let textEnd = html.indexOf("<"); // 如果是0 说名是个标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      // 开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);
      // 结束标签
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  return root;
}
