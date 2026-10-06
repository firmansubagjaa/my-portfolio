// Read-only DB connectivity probe (run with cwd = main server dir so bun loads .env)
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string, { max: 1, prepare: false, connect_timeout: 15 });
async function probe(label: string, q: () => Promise<unknown>) {
	const t = Date.now();
	try {
		const r = await q();
		console.log("ok", label, JSON.stringify(r), Date.now() - t, "ms");
	} catch (e) {
		console.log("err", label, (e as { code?: string }).code ?? (e as Error).message, Date.now() - t, "ms");
	}
}
await probe("select1", () => sql`select 1 as one`);
await probe("timeout", () => sql`show statement_timeout`);
await probe(
	"locks",
	() => sql`select count(*)::int as waiting from pg_stat_activity where wait_event_type = 'Lock'`,
);
await probe(
	"projects-locks",
	() =>
		sql`select l.mode, l.granted, a.state, now() - a.xact_start as age from pg_locks l join pg_stat_activity a on a.pid = l.pid where l.relation = 'projects'::regclass limit 10`,
);
await sql.end();
