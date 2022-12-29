// 我们可以给模板中的属性增加一个收集器dep
// 页面渲染的时候我们将渲染逻辑封装到watcher中   vm._update(vm._render())
// dep记住这个watcher即可，稍后属性变化了可以到对应的dep中存放的watcher进行重新渲染
// 观察者模式

import Dep from "./dep";

let id = 0;

// 不同的组件有不同的watcher
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;

    this.renderWatcher = options; // 是一个渲染watcher

    this.getter = fn; // getter意味着调用这个函数可以发生取值

    this.deps = []; // 计算属性 ...... 其他清理工作

    this.depsId = new Set();

    this.get();
  }
  // 一个组件 对应多个属性 ，重复属性不用再记录
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // wather 已经记住了dep 并且去重了，此时让dep也记住watcher
    }
  }

  get() {
    Dep.target = this; // 静态属性

    this.getter(); // 会去 vm 上取值

    Dep.target = null; // 渲染完 就清空
  }

  // 重新渲染
  update() {
    // this.get();
    queueWatcher(this); // 把当前watcher暂存起来
  }

  run() {
    this.get();
  }
}

let queue = [];
let has = {};
let pending = false; // 防抖

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run()); // 再刷新的过程中可能还有新的watcher,重新放大queue中
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    // 不管update 执行多少次，但是最终只执行一轮刷新
    if (!pending) {
      setTimeout(flushSchedulerQueue, 0);
      pending = true;
    }
    console.log(queue);
  }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0);
  console.log(cbs);
  callbacks = [];
  waiting = false;
  cbs.forEach((cb) => cb()); // 按照顺序依次执行
}

//vue2-源码中 nextTick没有直接使用某个api而是采用优雅降级的方式
//内部先采用的是promise（ie不兼容）---> Mutationobserver(h5的api) ---> 可以考虑ie专享的setImmediate ---> setTimeout

// let timerFunc;
// if (Promise) {
//   console.log(1);
//   //   timerFunc = () => {
//   //     Promise.resolve().then(flushCallbacks);
//   //   };
//   var p_1 = Promise.resolve();
//   timerFunc = function () {
//     console.log(p_1);
//     p_1.then(flushCallbacks);
//   };
// } else if (MutationObserver) {
//   console.log(2);
//   let observe = new MutationObserver(flushCallbacks); // 这里传入的回掉是异步执行的
//   let textNode = document.createTextNode(1);
//   observe.observe(textNode, {
//     characterData: true,
//   });
//   timerFunc = () => {
//     textNode.textContent = 2;
//   };
// } else if (setImmediate) {
//   console.log(3);

//   timerFunc = () => {
//     setImmediate(flushCallbacks);
//   };
// } else {
//   console.log(4);

//   timerFunc = () => {
//     setTimeout(flushCallbacks);
//   };
// }

export function nextTick(cb) {
  callbacks.push(cb); // 维护nextTick中的callback方法
  if (!waiting) {
    // 最后一起刷新
    setTimeout(flushCallbacks, 0); // ---> 好用
    // Promise.resolve().then(flushCallbacks); // ---> 不好用（有bug,未解决,应该用这个）
    // timerFunc(); // 做兼容性处理
    waiting = true;
  }
}

//需要给每个属性增加一个dep,目的就是收集watcher
//一个组件中有多少个属性(n个属性会对应一个视图) n个dep对应一个watcher
//1个属性对应着多个组件 1个dep对应多个watcher
//多对多的关系

export default Watcher;
