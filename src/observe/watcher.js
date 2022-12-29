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
    this.get();
  }
}

//需要给每个属性增加一个dep,目的就是收集watcher
//一个组件中有多少个属性(n个属性会对应一个视图) n个dep对应一个watcher
//1个属性对应着多个组件 1个dep对应多个watcher
//多对多的关系

export default Watcher;
