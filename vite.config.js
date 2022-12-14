import { defineConfig } from "vite"
import marko from "@marko/vite"
import cfDevServer from './cf-dev-server'


export default defineConfig(({ mode, ssrBuild }) => {
  console.log(mode, ssrBuild)
  return {
    resolve: {
      conditions: ssrBuild ? ["worker"] : undefined
    },
    plugins: [
      marko(),
      cfDevServer({script: './src/_worker.ts'}),
    ],
    build: {
      minify: true,
      outDir: "dist",
      emptyOutDir: false,
      assetsInlineLimit: 0
    },
    ssr: {
      target: "webworker",
      noExternal: mode === "production" || undefined,
    },
  }
});
