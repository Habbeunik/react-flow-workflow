import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

const pkg = JSON.parse(
	readFileSync('./package.json', 'utf8')
);

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.js',
			format: 'cjs',
			exports: 'named',
			sourcemap: true,
			interop: 'auto',
		},
		{
			file: 'dist/index.esm.js',
			format: 'es',
			exports: 'named',
			sourcemap: true,
			interop: 'auto',
		},
	],
	plugins: [
		resolve({
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
			preferBuiltins: true,
		}),
		commonjs({
			include: 'node_modules/**',
			transformMixedEsModules: true,
		}),
		typescript({
			tsconfig: './tsconfig.json',
			declaration: true,
			declarationDir: './dist',
			declarationMap: true,
			rootDir: './src',
		}),
	],
	external: [...Object.keys(pkg.peerDependencies || {})],
	onwarn(warning, warn) {
		// Skip certain warnings
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
		warn(warning);
	},
};
