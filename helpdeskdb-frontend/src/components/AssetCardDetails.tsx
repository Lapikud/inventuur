import { useTranslation } from "react-i18next";
import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { assetCardFields } from "./assetFields";

export function AssetCardDetails({ asset }: { asset: IAssetViewModel }) {
	const { t } = useTranslation(["assetviewmodel", "common"]);

	return (
		<>
			<h3 className="font-bold text-xl text-gray-800 mb-4 break-words">
				{asset.assetName}
			</h3>
			<div className="space-y-3 text-gray-600">
				{assetCardFields.map((field) => (
					<div key={field.labelKey} className="flex items-baseline gap-3">
						<span className="font-medium text-gray-700 min-w-[120px]">
							{t(field.labelKey)}:
						</span>
						<span className="break-words flex-1">
							{field.render(asset)}
						</span>
					</div>
				))}
			</div>
		</>
	);
}
