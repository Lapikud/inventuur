import { useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { Modal } from "./Modal";
import { ModalFooter } from "./ModalFooter";
import { ConfirmResult, DeleteSummaryField } from "./entityDialogTypes";

// The optional key overrides resolve in `namespace` (same "ns:Key" prefix
// rule as labelKey); omitted, they fall back to the "common" Delete wording.
interface EntityDeleteDialogProps<TEntity extends { id: string }> {
	open: boolean;
	entity: TEntity | null;
	namespace: string;
	// Subtitle key (the entity's type). Omit when passing `subtitle`.
	singularKey?: string;
	// Already-translated subtitle replacing singularKey — for dialogs that
	// head with the entity's name rather than its type.
	subtitle?: string;
	// Overrides "common:DeleteTitle".
	titleKey?: string;
	// Overrides "common:DeleteConfirmQuestion".
	questionKey?: string;
	// Overrides "common:DeleteButton".
	confirmLabelKey?: string;
	summaryFields: DeleteSummaryField<TEntity>[];
	onClose: () => void;
	onConfirm: (id: string) => ConfirmResult;
	isLoading: boolean;
}

export const EntityDeleteDialog = <TEntity extends { id: string }>({
	open,
	entity,
	namespace,
	singularKey,
	subtitle,
	titleKey,
	questionKey,
	confirmLabelKey,
	summaryFields,
	onClose,
	onConfirm,
	isLoading,
}: EntityDeleteDialogProps<TEntity>) => {
	const { t: tEntity } = useTranslation(namespace);
	const { t: tCommon } = useTranslation("common");

	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleClose = () => {
		setErrorMsg(null);
		onClose();
	};

	const handleSubmit = async () => {
		setErrorMsg(null);
		if (!entity) return;
		const result = await onConfirm(entity.id);
		if (result && result.error) {
			setErrorMsg(result.error);
		}
	};

	if (!entity) return null;

	const heading = subtitle ?? (singularKey ? tEntity(singularKey) : null);

	return (
		<Modal open={open} onClose={handleClose}>
			<h2 className="text-xl font-bold mb-2 text-black">
				{titleKey ? tEntity(titleKey) : tCommon("DeleteTitle")}
			</h2>
			<h3 className="text-base text-gray-700 mb-4">
				{questionKey
					? tEntity(questionKey)
					: tCommon("DeleteConfirmQuestion")}
			</h3>
			{heading && (
				<h4 className="text-lg font-semibold text-black mb-4">
					{heading}
				</h4>
			)}

			<ErrorBanner error={errorMsg} variant="dialog" />

			<div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100 grid grid-cols-2 gap-x-4 gap-y-3">
				{summaryFields.map((field) => (
					<div
						key={field.labelKey}
						className={field.half ? undefined : "col-span-2"}
					>
						<span className="block text-xs font-bold uppercase text-gray-500 mb-1">
							{tEntity(field.labelKey)}
						</span>
						<span className="text-gray-900 font-medium">
							{field.render(entity)}
						</span>
					</div>
				))}
			</div>

			<ModalFooter
				onCancel={handleClose}
				onConfirm={handleSubmit}
				isLoading={isLoading}
				confirmLabel={
					confirmLabelKey
						? tEntity(confirmLabelKey)
						: tCommon("DeleteButton")
				}
				destructive
				confirmType="button"
			/>
		</Modal>
	);
};
