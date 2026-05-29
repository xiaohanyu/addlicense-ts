import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  format: "esm",
  target: "esnext",
  treeshake: true,
  entry: ["src/bin.ts", "src/index.ts"],
  dts: true,
  sourcemap: true,
  splitting: false,
});
