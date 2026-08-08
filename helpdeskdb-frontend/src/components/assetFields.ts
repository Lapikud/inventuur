import { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import { IAssetViewModel } from "@/types/domain/IAssetViewModels";

export interface AssetField {
	/** Namespaced key, e.g. "assetviewmodel:AssetName" or "common:AddedAt". */
	labelKey: string;
	render: (asset: IAssetViewModel) => ReactNode;
}

// One rendering rule per field, shared by both views below.
const name: AssetField = {
	labelKey: "assetviewmodel:AssetName",
	render: (asset) => asset.assetName,
};
const serialNumber: AssetField = {
	labelKey: "assetviewmodel:SerialNumber",
	render: (asset) => asset.serialNumber || "-",
};
const category: AssetField = {
	labelKey: "assetviewmodel:Category",
	render: (asset) => asset.categoryName,
};
const owner: AssetField = {
	labelKey: "assetviewmodel:Owner",
	render: (asset) => asset.ownerName,
};
const room: AssetField = {
	labelKey: "assetviewmodel:RoomName",
	render: (asset) => asset.roomName,
};
const cupboard: AssetField = {
	labelKey: "assetviewmodel:CupboardName",
	render: (asset) => asset.cupboardName,
};
// The card has no room for two columns, so it shows them as one line.
const location: AssetField = {
	labelKey: "assetviewmodel:Location",
	render: (asset) => `${asset.roomName} ${asset.cupboardName}`,
};
const shelfNum: AssetField = {
	labelKey: "assetviewmodel:ShelfNum",
	render: (asset) => asset.shelfNum,
};
const column: AssetField = {
	labelKey: "assetviewmodel:Column",
	render: (asset) => asset.column,
};
const closestReservationBy: AssetField = {
	labelKey: "assetviewmodel:ClosestReservationBy",
	render: (asset) => asset.closestReservationBy,
};
const addedAt: AssetField = {
	labelKey: "common:AddedAt",
	render: (asset) => formatDate(asset.addedAt),
};

/** The table columns, in order — drives the header and every row. */
export const assetLineFields: AssetField[] = [
	name,
	serialNumber,
	category,
	owner,
	room,
	cupboard,
	shelfNum,
	column,
	closestReservationBy,
	addedAt,
];

/**
 * The card's labelled rows. Shorter than the line view on purpose: the name is
 * the card's heading rather than a labelled row, and room/cupboard collapse
 * into a single "Location".
 */
export const assetCardFields: AssetField[] = [
	serialNumber,
	category,
	owner,
	location,
	shelfNum,
	column,
	closestReservationBy,
	addedAt,
];
