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
  };
}
