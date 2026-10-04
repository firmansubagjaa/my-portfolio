// File: /client/src/lib/debug-shim.ts
// No-op replacement for the CJS `debug` package.
// micromark's "development" build imports `debug` for internal trace logging; the real
// package require()s `ms`, which Vite 8's rolldown pre-bundler can't resolve in the browser.
// Aliased in vite.config.ts. Production builds of micromark never import `debug`.
type Debugger = ((...args: unknown[]) => void) & { enabled: boolean; namespace: string };

export default function createDebug(namespace: string): Debugger {
	const noop = (() => {}) as Debugger;
	noop.enabled = false;
	noop.namespace = namespace;
	return noop;
}
