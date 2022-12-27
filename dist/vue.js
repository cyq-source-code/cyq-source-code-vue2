(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 重写数组的部分方法

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);

  // 7种改变原数组的方法
  // concat、slice不改变原数组
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    // 重写数组方法
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      console.log(method);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法、函数劫持（切片编程）

      // 需要对新增的数据，再进行劫持
      var inserted; // 新增的内容
      var ob = this.__ob__;
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
      }
      if (inserted) {
        // 对新增的内容再次进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.defineProperty只能劫持已经存在的属性（vue2为了解决这 单独写了一些API $set、$delete......）

      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false // 将__ob__变成不可枚举，（否则在walk()会进入死循环）
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
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // "重新定义" 属性---性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 劫持数组 [1, 2, { a: 2 }]
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }(); // 属性劫持（闭包应用）
  function defineReactive(target, key, value) {
    // 如果 value 还是对象 递归。
    observe(value);
    Object.defineProperty(target, key, {
      // 取值的时候会触发 get
      get: function get() {
        return value;
      },
      // 修改的时候会触发 set
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); // 新值可能是 对象
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对 data 对象 进行 数据劫持

    if (_typeof(data) !== "object" || data == null) {
      return; // 判断是不是对象
    }

    if (data.__ob__ instanceof Observer) {
      // 这个对象被劫持过了
      return data.__ob__;
    }

    //如果一个对象被劫持过了，就不需要再劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例判断是否劫持过）
    return new Observer(data);
  }

  function initState(vm) {
    var ops = vm.$options; // 获取所有用户选项
    if (ops.data) {
      initDate(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initDate(vm) {
    var data = vm.$options.data; // data 可能是 函数 或 对象
    data = typeof data === "function" ? data.call(vm) : data;

    // 数据劫持 Object.defineProperty
    observe(data);
    vm._data = data; // 将返回的对象放到 _data 上

    // 将 vm._data.XXX 代码为 vm.XXX
    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  // Vue 的 init() 方法
  function initMixin(Vue) {
    // 初始化
    Vue.prototype._init = function (options) {
      // options 用户配置
      // $data、$attr、$nextTick ......
      var vm = this;
      vm.$options = options; // 将用户选项挂载到实例上

      // 初始化状态
      initState(vm);
    };
  }

  // 将所有的方法耦合在一起
  function Vue(options) {
    // options 用户选项
    this._init(options);
  }
  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
