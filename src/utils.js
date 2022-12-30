const strats = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    // {} {created:function(){}} ===> {created:[fn]}
    // {created:[fn]} {created:function(){}} ===> {created:[fn,fn]}
    if (c) {
      if (p) {
        // 父亲有,儿子有，合并
        return p.concat(c);
      } else {
        // 儿子有，父亲没有，儿子包装成数组（作为后续父亲）
        return [c];
      }
    } else {
      // 儿子没有，直接返回父亲
      return p;
    }
  };
});
export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeFiled(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeFiled(key);
    }
  }
  function mergeFiled(key) {
    // 策略模式 用策略减少 if else 判断
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 如果不在策略中，以儿子为主
      options[key] = child[key] || parent[key]; // 优先采用儿子
    }
  }
  return options;
}
