// Minimal CDP driver for visual verification (not part of the repo).
// Usage: bun cdp.ts <scenario>   env: ADMIN_USER, ADMIN_PASS, BASE (default http://localhost:5174)
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:5174";
const OUT = join(import.meta.dir, "shots");
mkdirSync(OUT, { recursive: true });

const port = process.env.CDP_PORT ?? "9333";
const target = (await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json()) as {
	webSocketDebuggerUrl: string;
};
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

let seq = 0;
const pending = new Map<number, (v: any) => void>();
ws.addEventListener("message", (ev) => {
	const msg = JSON.parse(String(ev.data));
	if (msg.id && pending.has(msg.id)) {
		pending.get(msg.id)!(msg);
		pending.delete(msg.id);
	}
});
function send(method: string, params: Record<string, unknown> = {}): Promise<any> {
	const id = ++seq;
	ws.send(JSON.stringify({ id, method, params }));
	return new Promise((resolve, reject) =>
		pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result))),
	);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function evaluate<T = unknown>(expression: string): Promise<T> {
	const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
	if (r.exceptionDetails) throw new Error(`eval failed: ${expression}\n${JSON.stringify(r.exceptionDetails)}`);
	return r.result.value as T;
}
async function waitFor(expression: string, timeout = 10000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		if (await evaluate<boolean>(`!!(${expression})`)) return;
		await sleep(150);
	}
	throw new Error(`timeout waiting for: ${expression}`);
}
async function viewport(width: number, height: number, mobile = false) {
	await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
}
async function goto(path: string) {
	await send("Page.navigate", { url: BASE + path });
	await sleep(400);
	await waitFor("document.readyState === 'complete'");
	await sleep(600);
}
async function shot(name: string, full = false) {
	await sleep(400);
	let clip: Record<string, number> | undefined;
	if (full) {
		const m = await send("Page.getLayoutMetrics");
		clip = { x: 0, y: 0, width: m.cssContentSize.width, height: m.cssContentSize.height, scale: 1 };
	}
	const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, ...(clip && { clip }) });
	const file = join(OUT, `${name}.png`);
	writeFileSync(file, Buffer.from(r.data, "base64"));
	console.log("SHOT", file);
}
async function typeInto(selector: string, text: string) {
	await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); el.select?.(); })()`);
	await send("Input.insertText", { text });
}
async function key(keyName: string, code = keyName, keyCode = 0) {
	await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyName, code, windowsVirtualKeyCode: keyCode });
	await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code, windowsVirtualKeyCode: keyCode });
}
const clickText = (sel: string, text: string) =>
	evaluate(
		`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.textContent.trim() === ${JSON.stringify(text)}); if (!el) throw new Error('not found: ${text}'); el.click(); })()`,
	);
// The shared Supabase DB intermittently hits statement timeouts (57014); recover via the UI's "Coba lagi"
let retries = 0;
async function untilLoaded(cond: string, attempts = 5) {
	for (let i = 0; i < attempts; i++) {
		await waitFor(`(${cond}) || document.body.textContent.includes('Gagal memuat proyek.')`, 30000);
		if (await evaluate<boolean>(`!!(${cond})`)) return;
		retries++;
		console.log("RETRY backend error state shown, clicking Coba lagi");
		await clickText("button", "Coba lagi");
		await sleep(1500);
	}
	throw new Error(`still failing after retries: ${cond}`);
}
const log = (label: string, v: unknown) => console.log("CHECK", label, JSON.stringify(v));

await send("Page.enable");
// Headless pages are unfocused, so focus/blur events would otherwise not fire
await send("Emulation.setFocusEmulationEnabled", { enabled: true });
await send("Runtime.enable");
await viewport(1280, 900);

const scenario = process.argv[2] ?? "all";
const user = process.env.ADMIN_USER ?? "";
const pass = process.env.ADMIN_PASS ?? "";

async function login() {
	await goto("/admin/login");
	await typeInto("#username", user);
	await typeInto("#password", pass);
	await clickText("button", "Login");
	await waitFor("location.pathname === '/admin' && document.querySelector('h1')?.textContent === 'Manajemen Proyek'", 30000);
}

try {
	if (scenario === "login") {
		await goto("/admin/login");
		await shot("01-login");
		log("login.focus", await evaluate("document.activeElement?.id"));
		log("login.labelsFor", await evaluate("[...document.querySelectorAll('label')].map(l => l.htmlFor)"));
		// Wrong password -> 401 banner
		await typeInto("#username", user);
		await typeInto("#password", "wrong-password-123");
		await clickText("button", "Login");
		await waitFor("document.querySelector('[role=alert]')", 10000);
		log("login.alert", await evaluate("document.querySelector('[role=alert]').textContent"));
		log("login.path", await evaluate("location.pathname"));
		await shot("02-login-wrong-password");
		// Correct login lands on dashboard
		await typeInto("#password", pass);
		await clickText("button", "Login");
		await waitFor("location.pathname === '/admin' && document.querySelector('h1')?.textContent === 'Manajemen Proyek'", 15000);
		log("login.redirect", await evaluate("location.pathname"));
	}

	if (scenario === "dashboard") {
		await login();
		await untilLoaded("document.querySelector('table tbody tr') || document.body.textContent.includes('Belum ada proyek')");
		await waitFor("!document.querySelector('section[aria-label=\"Ringkasan proyek\"] .animate-pulse')", 30000);
		await sleep(500);
		await shot("03-dashboard", true);
		log(
			"colors",
			await evaluate(`(() => {
				const c = (el) => el ? getComputedStyle(el).color + ' on ' + getComputedStyle(el).backgroundColor : null;
				return {
					body: getComputedStyle(document.body).backgroundColor,
					h1: c(document.querySelector('h1')),
					th: c(document.querySelector('thead')),
					tdTitle: getComputedStyle(document.querySelector('tbody td p')).color,
					tdCategory: getComputedStyle(document.querySelectorAll('tbody td')[1]).color,
					searchInput: c(document.querySelector('input[type=search]')),
					select: c(document.querySelector('select')),
					hapus: c([...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Hapus')),
				};
			})()`),
		);
		log("categories", await evaluate("[...document.querySelectorAll('tbody tr td:nth-child(2)')].map(t => t.textContent)"));
		log("stats", await evaluate("[...document.querySelectorAll('section[aria-label=\"Ringkasan proyek\"] > div')].map(d => d.textContent)"));
		log("pagination", await evaluate("document.querySelector('nav[aria-label=Pagination]')?.textContent ?? 'none'"));
		log("summaryLine", await evaluate("[...document.querySelectorAll('p')].find(p => p.textContent.startsWith('Menampilkan'))?.textContent"));

		// Filters: category select narrows
		const firstCat = await evaluate<string>("document.querySelector('tbody tr td:nth-child(2)').textContent");
		await evaluate(`(() => { const s = document.querySelectorAll('select')[0]; const opt = [...s.options].find(o => o.textContent === ${JSON.stringify(firstCat)}); s.value = opt.value; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
		await untilLoaded(
			`document.querySelector('tbody tr') && [...document.querySelectorAll('tbody tr td:nth-child(2)')].every(t => t.textContent === ${JSON.stringify(firstCat)}) && !document.querySelector('[aria-label="Memperbarui daftar"]')`,
		);
		log("filter.category.rows", await evaluate("[...document.querySelectorAll('tbody tr td:nth-child(2)')].map(t => t.textContent)"));
		await shot("04-dashboard-filtered-category");
		await clickText("button", "Reset filter");
		await sleep(800);

		// Search with no results -> empty state, input keeps focus while typing
		await typeInto("input[type=search]", "zzz-tidak-ada-proyek");
		await sleep(200);
		log("search.focusKept", await evaluate("document.activeElement?.type"));
		await untilLoaded("document.body.textContent.includes('Tidak ada proyek yang cocok dengan filter.')");
		log("search.focusAfterResults", await evaluate("document.activeElement?.type"));
		await shot("05-dashboard-filtered-empty");
		await clickText("button", "Reset filter");
		await untilLoaded("document.querySelector('table tbody tr') && !document.querySelector('[aria-label=\"Memperbarui daftar\"]')");

		// Delete dialog
		await evaluate("[...document.querySelectorAll('table button')].find(b => b.textContent.trim() === 'Hapus').focus()");
		await evaluate("document.activeElement.click()");
		await waitFor("document.querySelector('[role=dialog]')");
		log(
			"dialog",
			await evaluate(`(() => { const d = document.querySelector('[role=dialog]'); return { modal: d.getAttribute('aria-modal'), labelledby: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent, focused: document.activeElement.textContent, bodyOverflow: document.body.style.overflow }; })()`),
		);
		await shot("06-delete-dialog");
		// Tab trap: Tab twice cycles back to Batal
		await key("Tab", "Tab", 9);
		await key("Tab", "Tab", 9);
		log("dialog.tabTrap", await evaluate("document.activeElement.textContent"));
		await key("Escape", "Escape", 27);
		await sleep(300);
		log(
			"dialog.afterEscape",
			await evaluate("({ open: !!document.querySelector('[role=dialog]'), focusLabel: document.activeElement.getAttribute('aria-label') })"),
		);

		// Mobile
		await viewport(375, 812, true);
		await sleep(800);
		await shot("07-dashboard-mobile", true);
		log("mobile.tableVisible", await evaluate("getComputedStyle(document.querySelector('table').parentElement).display"));
		log("mobile.scrollWidth", await evaluate("[document.documentElement.scrollWidth, window.innerWidth]"));
		await viewport(1280, 900);
	}

	if (scenario === "editor") {
		await login();
		await goto("/admin/projects/new");
		await waitFor("document.querySelector('.w-md-editor')", 15000);
		await shot("08-create-project", true);
		log(
			"editor.colors",
			await evaluate(`(() => {
				const bg = (s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).backgroundColor + ' / ' + getComputedStyle(el).color : null; };
				return { editor: bg('.w-md-editor'), toolbar: bg('.w-md-editor-toolbar'), textarea: bg('.w-md-editor-text-input'), preview: bg('.wmde-markdown'), input: bg('input[placeholder=\"Judul proyek\"]'), select: bg('select') };
			})()`),
		);
		log("editor.mdTextareaLabel", await evaluate("!!document.querySelector('label[for=\"' + document.querySelector('.w-md-editor-text-input').id + '\"]')"));
		// Title -> auto slug, blur -> slug check
		await typeInto("input[placeholder='Judul proyek']", "Proyek Uji Visual Kiro");
		await evaluate("document.querySelector(\"input[placeholder='Judul proyek']\").blur()");
		await waitFor("document.body.textContent.includes('Slug tersedia') || document.body.textContent.includes('Slug sudah digunakan') || document.body.textContent.includes('Tidak dapat memeriksa')", 30000);
		log("slug.value", await evaluate("document.querySelector('input.font-mono').value"));
		log("slug.status", await evaluate("document.querySelector('[aria-live=polite].min-h-5')?.textContent"));
		await evaluate("document.querySelector('input.font-mono').scrollIntoView({block: 'center'})");
		await shot("09-create-slug-available");
		// Submit empty-ish form -> validation messages (no network)
		await evaluate("document.querySelector(\"input[placeholder='Judul proyek']\").scrollIntoView({block:'start'})");
		await clickText("button", "Buat Proyek");
		await sleep(600);
		log("validation.errors", await evaluate("[...document.querySelectorAll('p.text-red-400')].map(p => p.textContent)"));
		await shot("10-create-validation", true);

		// Edit page of the first project
		await goto("/admin");
		await waitFor("document.querySelector('table tbody tr a[aria-label^=Edit]')", 15000);
		await evaluate("document.querySelector('table tbody tr a[aria-label^=Edit]').click()");
		await waitFor("location.pathname.endsWith('/edit') && document.querySelector('.w-md-editor')", 15000);
		await sleep(1200);
		log("edit.title", await evaluate("document.querySelector(\"input[placeholder='Judul proyek']\").value"));
		await shot("11-edit-project", true);
		// Slug check in edit mode for its own slug should show nothing
		await evaluate("document.querySelector('input.font-mono').focus()");
		await evaluate("document.querySelector('input.font-mono').blur()");
		await sleep(800);
		log("edit.ownSlugStatus", await evaluate("document.querySelector('[aria-live=polite].min-h-5')?.textContent"));

		// Logout
		await clickText("button", "Logout");
		await waitFor("location.pathname === '/admin/login'", 8000);
		log("logout.path", await evaluate("location.pathname"));
	}
	if (scenario === "edit") {
		await login();
		await goto(`/admin/projects/${process.env.EDIT_ID}/edit`);
		await waitFor("document.querySelector('.w-md-editor') && document.querySelector(\"input[placeholder='Judul proyek']\")?.value", 60000);
		await sleep(1500);
		log("edit.title", await evaluate("document.querySelector(\"input[placeholder='Judul proyek']\").value"));
		log("edit.slug", await evaluate("document.querySelector('input.font-mono').value"));
		log("edit.tags", await evaluate("[...document.querySelectorAll('button[aria-label^=\"Hapus tag\"]')].map(b => b.textContent)"));
		log("edit.submitLabel", await evaluate("document.querySelector('button[type=submit]').textContent"));
		await shot("11-edit-project", true);
		await evaluate("document.querySelector('.w-md-editor').scrollIntoView({block: 'start'})");
		await evaluate("window.scrollBy(0, -80)");
		await shot("12-edit-markdown-and-media");
		// Own slug: no advisory warning in edit mode
		await evaluate("document.querySelector('input.font-mono').focus()");
		await evaluate("document.querySelector('input.font-mono').blur()");
		await sleep(800);
		log("edit.ownSlugStatus", await evaluate("document.querySelector('[aria-live=polite].min-h-5')?.textContent"));
		// Mobile header
		await viewport(375, 812, true);
		await sleep(600);
		await evaluate("window.scrollTo(0, 0)");
		await shot("13-edit-mobile");
		await viewport(1280, 900);
		await clickText("button", "Logout");
		await waitFor("location.pathname === '/admin/login'", 30000);
		log("logout.path", await evaluate("location.pathname"));
	}
} catch (err) {
	console.log("RETRIES", retries); console.error("FAIL", (err as Error).message);
	await shot(`error-${scenario}`).catch(() => {});
	process.exitCode = 1;
} finally {
	ws.close();
}
