import { initMixin } from "./init";

// 将所有的方法耦合在一起
function Vue(options) {
  // options 用户选项
  this._init(options);
}

initMixin(Vue); // 扩展了init方法

export default Vue;
