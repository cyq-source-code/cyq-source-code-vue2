import { compileToFunction } from "./compiler";
import { initState } from "./state";

// Vue 的 init() 方法
export function initMixin(Vue) {
  // 初始化
  Vue.prototype._init = function (options) {
    // options 用户配置
    // $data、$attr、$nextTick ......
    const vm = this;
    vm.$options = options; // 将用户选项挂载到实例上

    // 初始化状态
    initState(vm);

    if (options.el) {
      vm.$mount(options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const ops = vm.$options;
    el = document.querySelector(el);
    // 检查用户选项 有没有 render 函数
    if (!ops.render) {
      let template;
      // 有没有 template 和 el
      if (!ops.template && el) {
        template = el.outerHTML;
      } else {
        if (el) {
          template = ops.template; // 用户选项写了 template 用 template
        }
      }
      console.log(template);

      if (template) {
        // 对模版进行编译
        const render = compileToFunction(template);
        ops.render = render;
      }
    }

    ops.render; // 最终的render方法
  };
}
