// 重写数组的部分方法

let oldArrayProto = Array.prototype;

export let newArrayProto = Object.create(oldArrayProto);

// 7种改变原数组的方法
// concat、slice不改变原数组
let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

methods.forEach((method) => {
  // 重写数组方法
  newArrayProto[method] = function (...args) {
    console.log(method);
    const result = oldArrayProto[method].call(this, ...args); // 内部调用原来的方法、函数劫持（切片编程）

    // 需要对新增的数据，再进行劫持
    let inserted; // 新增的内容
    let ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift":
        // arr.push(1,2,3)、 arr.unshift(4,5,6)
        inserted = args;
        break;

      case "splice":
        // arr.splice(1, 2, { a: 2 });
        inserted = args.slice(2);
        break;
      default:
        break;
    }

    if (inserted) {
      // 对新增的内容再次进行观测
      ob.observeArray(inserted);
    }

    return result;
  };
});
