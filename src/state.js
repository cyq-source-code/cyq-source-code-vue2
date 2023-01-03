import { observe } from "./observe";
import Dep from "./observe/dep";
import Watcher from "./observe/watcher";
export function initState(vm) {
  const ops = vm.$options; // 获取所有用户选项
  if (ops.data) {
    initDate(vm);
  }
  if (ops.computed) {
    initComputed(vm);
  }
  if (ops.watch) {
    initWatch(vm);
  }
}

function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // 字符串、数组、函数、（对象暂不实现）
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  } else {
  }
  return vm.$watch(key, handler);
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

function initDate(vm) {
  let data = vm.$options.data; // data 可能是 函数 或 对象
  data = typeof data === "function" ? data.call(vm) : data;

  // 数据劫持 Object.defineProperty
  observe(data);

  vm._data = data; // 将返回的对象放到 _data 上

  // 将 vm._data.XXX 代码为 vm.XXX
  for (let key in data) {
    proxy(vm, "_data", key);
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {}); // 将计算属性watcher保存到vm上
  for (let key in computed) {
    let userDef = computed[key];

    let fn = typeof userDef === "function" ? userDef : userDef.get;
    // 监控计算属性中get的变化
    // 如果直接 new Watcher 默认就会执行，将属性和watchers对应起来
    watchers[key] = new Watcher(vm, fn, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  // const getter = typeof userDef === "function" ? userDef : userDef.get;
  const setter = userDef.set || (() => {});

  // 可以通过实例拿到对应属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性根本不会收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  // 需要检测是否要执行这个getter
  return function () {
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      // 如果是脏的就去执行 用户传入的getter
      watcher.evaluate(); // 求值后 dirty 变为了false,下次就不求值了
    }
    if (Dep.target) {
      // 计算属性出栈后，还要渲染watcher,应该让计算属性的watcher里的属性 也去收集上层watcher
      watcher.depend();
    }
    return watcher.value;
  };
}
