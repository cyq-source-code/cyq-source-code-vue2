class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性（vue2为了解决这 单独写了一些API $set、$delete......）
    this.walk(data);
  }
  // 循环对象 对属性依次劫持
  walk(data) {
    // "重新定义" 属性---性能差
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
}

// 属性劫持（闭包应用）
export function defineReactive(target, key, value) {
  // 如果 value 还是对象 递归。
  observe(value);

  Object.defineProperty(target, key, {
    // 取值的时候会触发 get
    get() {
      return value;
    },
    // 修改的时候会触发 set
    set(newValue) {
      if (newValue === value) return;
      observe(newValue); // 新值可能是 对象
      value = newValue;
    },
  });
}

export function observe(data) {
  // 对 data 对象 进行 数据劫持

  if (typeof data !== "object" || data == null) {
    return; // 判断是不是对象
  }

  //如果一个对象被劫持过了，就不需要再劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例判断是否劫持过）
  return new Observer(data);
}
