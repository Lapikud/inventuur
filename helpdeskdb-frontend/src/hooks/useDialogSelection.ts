"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Writes a single query param without disturbing the others, or deletes it
 * when the value is null. `scroll: false` because these params only annotate
 * which dialog is open — the list underneath must not jump.
 */
const useSetQueryParam = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	return useCallback(
		(key: string, value: string | null) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
			router.replace(`${window.location.pathname}?${params.toString()}`, {
				scroll: false,
			});
		},
		[router, searchParams],
	);
};

interface UseDialogSelectionOptions<T> {
	/** Mirrors the selection into the URL. Omit for dialogs that don't. */
	queryParamKey?: string;
	/** Id written to the query param; defaults to the value itself. */
	getId?: (value: T) => string;
}

/**
 * One dialog's selection: the entity (or id) the dialog acts on, plus the
 * optional URL breadcrumb that goes with it.
 *
 * The param is write-only — nothing reads it back on mount, so a refresh
 * lands on the page with no dialog open. That's the existing behavior; making
 * these deep-linkable would be a separate change.
 *
 * Deliberately one call per dialog rather than one hook over all of them: the
 * overview's dialogs derive `open` in genuinely different ways (plain
 * selection, query-gated, row-lookup-gated), and folding that into a single
 * hook would hide it.
 */
export function useDialogSelection<T>(
	options: UseDialogSelectionOptions<T> = {},
) {
	const { queryParamKey, getId } = options;
	const [selected, setSelected] = useState<T | null>(null);
	const setQueryParam = useSetQueryParam();

	const select = useCallback(
		(value: T) => {
			setSelected(value);
			if (queryParamKey) {
				setQueryParam(
					queryParamKey,
					getId ? getId(value) : String(value),
				);
			}
		},
		[queryParamKey, getId, setQueryParam],
	);

	const clear = useCallback(() => {
		setSelected(null);
		if (queryParamKey) setQueryParam(queryParamKey, null);
	}, [queryParamKey, setQueryParam]);

	return { selected, select, clear };
}
