(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

  var ncname = "[a-z A-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的分组是一个标签名<xxx匹配到的是开始标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配的是</xxxx>最终匹配到的分组就是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性 //第一个分组就是属性的key value就是分组3/分组4/分组五
  var startTagClose = /^\s*(\/?)>/; //<div><br/>

  function parseHTML(html) {
    var ELEMENT_TYPE = 1; // 元素类型
    var TEXT_TYPE = 3; // 文本类型
    var stack = []; // 栈，存放元素
    var currentParent; // 指向栈的最后一个元素
    var root; //根节点

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      console.log("开始标签", tag, attrs);
      var node = createASTElement(tag, attrs); // 创建一个ast节点
      if (!root) {
        // 如果是空树，则当前节点为树的根节点
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent; // 指定当前元素的父元素
        currentParent.children.push(node); // 添进父元素的children里
      }

      stack.push(node);
      currentParent = node; // 更新 父元素
    }

    function chars(text) {
      console.log("文本内容", text);
      // 文本直接放到当前指向的节点
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      console.log("结束标签", tag);
      stack.pop(); // 删除最后一个元素
      currentParent = stack[stack.length - 1]; // 更新 父元素
    }

    // 逐个匹配，删除匹配过的字符
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length);
        // 如果不是开始标签的结束，就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; // 不是开始标签
    }

    while (html) {
      // 如果textEnd === 0 说明是一个开始标签或者结束标签
      // 如果textEnd > 0 说明就是文本的结束位置
      var textEnd = html.indexOf("<"); // 如果是0 说名是个标签
      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        // 开始标签
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        // 结束标签
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }
    console.log(root);
    return root;
  }

  function genProps(attrs) {
    var str = "";
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === "style") {
        var obj = {};
        attr.value.split(";").forEach(function (item) {
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{asdsadsa}匹配到的内容就是我们表达式的变量
  function gen(node) {
    // 标签
    if (node.type === 1) {
      return codegen(node);
    }
    // 文本
    else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        var lastIndex = 0;
        defaultTagRE.lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }

  // 对模版进行编译处理
  function compileToFunction(template) {
    console.log(template);
    // 1.将 template 转化成 ast 语法树
    var ast = parseHTML(template);
    console.log(ast);
    // 2.生成render方法，（render方法执行后的返回结果就是虚拟DOM）
    console.log(codegen(ast));
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
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      var ops = vm.$options;
      el = document.querySelector(el);
      // 检查用户选项 有没有 render 函数
      if (!ops.render) {
        var template;
        // 有没有 template 和 el
        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 用户选项写了 template 用 template
          }
        }

        console.log(template);
        if (template) {
          // 对模版进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
      ops.render; // 最终的render方法
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
