// File: /client/src/components/ui/Select.tsx
// shadcn/ui Select (Base UI variant, style "base-nova"), ported by hand with the project's own
// tokens (bg-surface, text-fg, text-muted, border-border, accent) instead of shadcn CSS variables.
// Do NOT run `shadcn add select`: on a case-insensitive FS it would overwrite this file with
// `select.tsx` and the stock shadcn classes. Callers use `SelectField` (labeled form field).
import { Select as SelectPrimitive } from "@base-ui/react/select";
import type * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { FieldError } from "./FieldError";
import { describedBy } from "./field-styles";

function ChevronDownIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	);
}

function ChevronUpIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m18 15-6-6-6 6" />
		</svg>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cn("scroll-my-1 p-1", className)}
			{...props}
		/>
	);
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			className={cn("flex flex-1 text-left", className)}
			{...props}
		/>
	);
}

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex w-fit cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-bg px-3 py-2 text-left text-sm whitespace-nowrap text-fg transition-colors outline-none select-none hover:border-muted/50 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/30 data-placeholder:text-muted *:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 text-muted" />} />
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	side = "bottom",
	sideOffset = 4,
	align = "center",
	alignOffset = 0,
	alignItemWithTrigger = true,
	...props
}: SelectPrimitive.Popup.Props &
	Pick<
		SelectPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
	>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				alignItemWithTrigger={alignItemWithTrigger}
				className="isolate z-50 outline-none"
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					data-align-trigger={alignItemWithTrigger}
					className={cn(
						"relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-surface p-1 text-fg shadow-lg shadow-black/40 outline-none transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
						className,
					)}
					{...props}
				>
					<SelectScrollUpButton />
					<SelectPrimitive.List>{children}</SelectPrimitive.List>
					<SelectScrollDownButton />
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			className={cn("px-2 py-1 text-xs text-muted", className)}
			{...props}
		/>
	);
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-pointer items-center gap-2 rounded py-1.5 pr-8 pl-2 text-sm text-fg outline-hidden select-none data-highlighted:bg-border data-highlighted:text-fg data-selected:font-medium data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
				{children}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator
				render={
					<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-accent" />
				}
			>
				<CheckIcon className="pointer-events-none" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	return (
		<SelectPrimitive.ScrollUpArrow
			data-slot="select-scroll-up-button"
			className={cn(
				"top-0 z-10 flex w-full cursor-default items-center justify-center bg-surface py-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon />
		</SelectPrimitive.ScrollUpArrow>
	);
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	return (
		<SelectPrimitive.ScrollDownArrow
			data-slot="select-scroll-down-button"
			className={cn(
				"bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-surface py-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon />
		</SelectPrimitive.ScrollDownArrow>
	);
}

interface SelectFieldProps<V extends string> {
	label: string;
	required?: boolean;
	error?: { message?: string };
	options: { value: V; label: string }[];
	/** Label of a leading "all" item whose value is `null` (clears the selection) */
	placeholder?: string;
	value: V | null;
	onValueChange: (value: V | null) => void;
	onBlur?: React.FocusEventHandler<HTMLButtonElement>;
	name?: string;
	id?: string;
	disabled?: boolean;
	className?: string;
	ref?: React.Ref<HTMLButtonElement>;
}

/** Labeled select field: label, trigger, popup list and validation error */
function SelectField<V extends string>({
	label,
	required,
	error,
	options,
	placeholder,
	value,
	onValueChange,
	onBlur,
	name,
	id: idProp,
	disabled,
	className,
	ref,
}: SelectFieldProps<V>) {
	const generatedId = useId();
	const id = idProp ?? generatedId;
	const errorId = `${id}-error`;
	const hasError = !!error?.message;
	const items: { value: V | null; label: string }[] = placeholder
		? [{ value: null, label: placeholder }, ...options]
		: options;

	return (
		<div className="flex flex-col gap-1.5">
			<Select<V | null>
				items={items}
				value={value}
				onValueChange={(next) => onValueChange(next)}
				name={name}
				disabled={disabled}
			>
				<SelectPrimitive.Label className="text-sm font-medium text-fg">
					{label}
					{required && (
						<span aria-hidden="true" className="ml-1 text-red-400">
							*
						</span>
					)}
				</SelectPrimitive.Label>
				<SelectTrigger
					ref={ref}
					id={id}
					onBlur={onBlur}
					className={cn("w-full", className)}
					aria-invalid={hasError || undefined}
					aria-required={required || undefined}
					aria-describedby={describedBy(hasError && errorId)}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent alignItemWithTrigger={false}>
					{items.map((item) => (
						<SelectItem key={item.value ?? "__all"} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldError id={errorId} error={error} />
		</div>
	);
}

export {
	Select,
	SelectContent,
	SelectField,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
