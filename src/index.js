import { initGloablAPI } from "./gloablAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

// 将所有的方法耦合在一起
function Vue(options) {
  // options 用户选项
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;

Vue.prototype.$watch = function (exprOrFn, cb) {
  console.log(exprOrFn, cb);
  // 监听的值变化了，执行cb方法
  new Watcher(this, exprOrFn, { user: true }, cb);
};

initMixin(Vue); // 扩展了init方法
initLifeCycle(Vue);
initGloablAPI(Vue);
export default Vue;
