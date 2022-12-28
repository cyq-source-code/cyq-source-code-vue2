// rollup可以导出一个对象，作为打包的配置文件
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
export default {
  input: "./src/index.js", // 入口文件
  output: {
    file: "./dist/vue.js", // 出口文件
    name: "Vue", // global.Vue
    format: "umd", // esm es模块、commonjs模块、umd(commonjs、amd)
    sourcemap: true, // 是否可以调试代码，debugger
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // 排除node_modeules下的所有文件
    }),
    resolve(),
  ],
};
