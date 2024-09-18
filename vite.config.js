import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig({
	plugins: [ViteMinifyPlugin({})],
	css: {
		postcss: {
			plugins: [tailwindcss()],
		},
	},
	base: "",
});
