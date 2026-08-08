import { formatDateTime } from "@/lib/format";
import { IAssetReservationWithNames } from "@/types/domain/DomainTypes";
import { DeleteSummaryField } from "../common/entityDialogTypes";

// The overview's "free up this reservation" confirmation. The reservation's
// asset name heads the dialog, so the summary is just the two dates, side by
// side.
export const removeReservationSummary: DeleteSummaryField<IAssetReservationWithNames>[] =
	[
		{
			labelKey: "assetreservation:ReservationFrom",
			render: (r) => formatDateTime(r.reservationFrom),
			half: true,
		},
		{
			labelKey: "assetreservation:ReservationTo",
			render: (r) => formatDateTime(r.reservationTo),
			half: true,
		},
	];

// The /assetReservations delete confirmation. Rendered by the generic dialog
// in the "assetreservation" namespace, so these keys need no prefix.
export const deleteAssetReservationSummary: DeleteSummaryField<IAssetReservationWithNames>[] =
	[
		{ labelKey: "AssetId", render: (r) => r.assetName },
		{ labelKey: "UserId", render: (r) => r.userName },
		{
			labelKey: "ReservationFrom",
			render: (r) => formatDateTime(r.reservationFrom),
			half: true,
		},
		{
			labelKey: "ReservationTo",
			render: (r) => formatDateTime(r.reservationTo),
			half: true,
		},
	];
