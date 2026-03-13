// @ts-check
import postcssOKLabFunction from "@csstools/postcss-oklab-function";
import postcssProgressiveCustomProperties from "@csstools/postcss-progressive-custom-properties";
import postcssPresetEnv from "postcss-preset-env";
import postcssNesting from "postcss-nesting";
import cssnano from "cssnano";

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: (() => {
    const plugins = [
      postcssOKLabFunction(),
      postcssProgressiveCustomProperties(),
      postcssPresetEnv({
        stage: 3,
        browsers: ["last 2 versions", "> 1%", "not dead"]
      }),
      postcssNesting()
    ];

    if (process.env.NODE_ENV === "production") {
      plugins.push(cssnano());
    }

    return plugins;
  })()
};
