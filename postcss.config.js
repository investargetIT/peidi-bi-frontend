// @ts-check
import postcssOKLabFunction from "@csstools/postcss-oklab-function";
import postcssNesting from "postcss-nesting";
import cssnano from "cssnano";

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: (() => {
    const plugins = [postcssOKLabFunction(), postcssNesting()];

    if (process.env.NODE_ENV === "production") {
      plugins.push(cssnano());
    }

    return plugins;
  })()
};
