import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性（vue2为了解决这 单独写了一些API $set、$delete......）

    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false, // 将__ob__变成不可枚举，（否则在walk()会进入死循环）
    });
    // data.__ob__ = this; // 1.通过__ob__访问方法属性、2.给数据添加了一个标识，存在__ob__证明劫持过了

    // 判断是否为数组 - 单独处理
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto; // 重写数组的方法

      this.observeArray(data); // 如果数组中放油对象，可以监听对象的变化
    } else {
      this.walk(data);
    }
  }
  // 循环对象 对属性依次劫持
  walk(data) {
    // "重新定义" 属性---性能差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    // 劫持数组 [1, 2, { a: 2 }]
    data.forEach((item) => observe(item));
  }
}

// 属性劫持（闭包应用）
export function defineReactive(target, key, value) {
  // 如果 value 还是对象 递归。
  observe(value);
  let dep = new Dep(); // 每个属性都有对应的dep
  Object.defineProperty(target, key, {
    // 取值的时候会触发 get
    get() {
      if (Dep.target) {
        dep.depend(); // 让这个属性的收集器记住当前的watcher
      }

      return value;
    },
    // 修改的时候会触发 set
    set(newValue) {
      if (newValue === value) return;
      observe(newValue); // 新值可能是 对象
      value = newValue;
      dep.notify(); // 通知更新
    },
  });
}

export function observe(data) {
  // 对 data 对象 进行 数据劫持

  if (typeof data !== "object" || data == null) {
    return; // 判断是不是对象
  }
  if (data.__ob__ instanceof Observer) {
    // 这个对象被劫持过了
    return data.__ob__;
  }

  //如果一个对象被劫持过了，就不需要再劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例判断是否劫持过）
  return new Observer(data);
}
