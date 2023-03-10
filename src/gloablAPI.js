import { mergeOptions } from "./utils";

export function initGloablAPI(Vue) {
  // 静态方法
  Vue.options = {};
  Vue.mixin = function (mixin) {
    // 我们期望将用户的选项 和 全局的 options 进行合并
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
