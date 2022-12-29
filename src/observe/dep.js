let id = 0;

class Dep {
  constructor() {
    this.id = id++; // 属性的dep 要收集watcher
    this.subs = []; // 存放当前属性对应的watcher有哪些
  }

  depend() {
    // this.subs.push(Dep.target); // 会重复收集

    Dep.target.addDep(this); // 让 watcher 记住 dep
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update()); // 告诉 watcher 要更新了
  }
}
Dep.target = null;

export default Dep;
