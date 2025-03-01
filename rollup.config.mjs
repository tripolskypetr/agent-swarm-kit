import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import path from "path";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: path.join("build", "index.mjs"),
        sourcemap: true,
        format: "esm",
      },
      {
        file: path.join("build", "index.cjs"),
        sourcemap: true,
        format: "commonjs",
      },
    ],
    plugins: [
      peerDepsExternal({
        includeDependencies: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        noEmit: true,
      }),
      terser({
        ecma: 2020,
        compress: {
          drop_console: false,
        },
        format: {
          comments: false,
        },
        sourceMap: true,
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "./types.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
