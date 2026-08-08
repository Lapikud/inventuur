import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { assetLineFields } from "./assetFields";

export function AssetLineDetails({ asset }: { asset: IAssetViewModel }) {
	return (
		<>
			{assetLineFields.map((field) => (
				<div
					key={field.labelKey}
					className="p-2 text-center truncate hover:whitespace-normal"
				>
					{field.render(asset)}
				</div>
			))}
		</>
	);
}
