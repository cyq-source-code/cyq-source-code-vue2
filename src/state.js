import { observe } from "./observe/index.js";

export function initState(vm) {
  const ops = vm.$options; // 获取所有用户选项
  if (ops.data) {
    initDate(vm);
  }
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
