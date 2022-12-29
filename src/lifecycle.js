import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  // 标签
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag); // 将真实节点和虚拟节点对应起来
    patchProps(vnode.el, data); // 属性
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
function patchProps(el, props) {
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
function patch(oldVNode, vnode) {
  // 初始化
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; // 获取真实元素
    const parentElm = elm.parentNode; // 拿到父元素
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling);
    parentElm.removeChild(elm); // 删除老节点

    return newElm;
  } else {
    // diff
  }
}

export function initLifeCycle(Vue) {
  // 虚拟DOM--->真实DOM
  Vue.prototype._update = function (vnode) {
    console.log("update", vnode);

    const vm = this;
    const el = vm.$el;

    // 初始化 && 更新
    vm.$el = patch(el, vnode);
  };

  //_c('div',{},children:[])
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  //_v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };

  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };

  Vue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm); // 通过ast语法转译后生成的render方法
  };
}
export function mountComponent(vm, el) {
  vm.$el = el;

  // 1. 调用render方法产生虚拟节点 虚拟DOM

  const updateCompontent = () => {
    vm._update(vm._render()); // vm.$options.render 虚拟节点
  };

  console.log(new Watcher(vm, updateCompontent, true));

  // 2. 根据虚拟DOM产生真实DOM
  // 3. 插入到元素el
}

// vue核心流程
// 1. 创造响应式数据
// 2. 模板转换成ast语法树
// 3. 将ast语法树转换成render函数
// 4. 后续每次到数据更新只需要执行render函数（无需再执行ast转化过程）

// render函数会产生虚拟节点（虚拟DOM）(使用响应式数据)
// 根据生成的虚拟节点创造真实DOM
