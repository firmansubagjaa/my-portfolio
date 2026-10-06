// Dependency-free SSR tests for SelectField (bun:test + react-dom/server)
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SelectField } from "@/components/ui/Select";

const options = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
];

/** Opening tag of the first element carrying `data-slot="select-trigger"` */
function triggerTag(html: string): string {
	const match = html.match(/<button[^>]*data-slot="select-trigger"[^>]*>/);
	if (!match) throw new Error(`trigger not rendered: ${html}`);
	return match[0];
}

/** Inner HTML of the trigger button */
function triggerContent(html: string): string {
	const start = html.indexOf(triggerTag(html));
	return html.slice(start, html.indexOf("</button>", start));
}

function attr(tag: string, name: string): string | undefined {
	return tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
}

/** Text of the element with the given id */
function textById(html: string, id: string): string {
	const match = html.match(new RegExp(`<(\\w+)[^>]*id="${id}"[^>]*>([\\s\\S]*?)</\\1>`));
	return (match?.[2] ?? "").replace(/<[^>]+>/g, "");
}

describe("SelectField", () => {
	test("shows the selected label and renders the field label", () => {
		const html = renderToStaticMarkup(
			<SelectField label="Status" options={options} value="published" onValueChange={() => {}} />,
		);
		const tag = triggerTag(html);
		expect(attr(tag, "role")).toBe("combobox");
		expect(triggerContent(html)).toContain("Published");
		// Base UI links this label to the trigger (aria-labelledby) in a client effect,
		// so SSR only shows the label element; the link is checked in the browser pass.
		const labelId = html.match(/<div id="([^"]*-label)"/)?.[1];
		expect(labelId).toBeTruthy();
		expect(textById(html, labelId ?? "")).toBe("Status");
	});

	test("links the error message and marks the trigger invalid", () => {
		const html = renderToStaticMarkup(
			<SelectField
				label="Status"
				options={options}
				value="draft"
				onValueChange={() => {}}
				error={{ message: "Wajib diisi" }}
			/>,
		);
		const tag = triggerTag(html);
		expect(attr(tag, "aria-invalid")).toBe("true");
		const describedById = attr(tag, "aria-describedby");
		expect(describedById).toBeTruthy();
		expect(textById(html, describedById ?? "")).toBe("Wajib diisi");
	});

	test("shows the placeholder ('all') label when value is null", () => {
		const html = renderToStaticMarkup(
			<SelectField
				label="Status"
				placeholder="Semua Status"
				options={options}
				value={null}
				onValueChange={() => {}}
			/>,
		);
		expect(triggerContent(html)).toContain("Semua Status");
	});

	test("marks required fields", () => {
		const html = renderToStaticMarkup(
			<SelectField
				label="Kategori"
				required
				options={options}
				value="draft"
				onValueChange={() => {}}
			/>,
		);
		expect(attr(triggerTag(html), "aria-required")).toBe("true");
		expect(html).toContain('<span aria-hidden="true" class="ml-1 text-red-400">*</span>');
	});
});
