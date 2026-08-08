"use client";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import {
	useRoles,
	useUserRoles,
	useUsers,
} from "@/hooks/queries/entityQueries";
import { IUserWithRoles } from "@/types/domain/DomainTypes";
import ListPageWrapper from "@/components/ListPageWrapper";
import DataTable from "@/components/DataTable";
import ErrorBanner from "@/components/ErrorBanner";

export default function Users() {
	const { t: tUser } = useTranslation("appuser");
	const { t: tRole } = useTranslation("approle");

	const { data: users, error } = useUsers();
	const { data: roles } = useRoles();
	const { data: userRoles } = useUserRoles();

	const data: IUserWithRoles[] = useMemo(() => {
		if (!users) return [];

		const roleNameById = new Map((roles ?? []).map((r) => [r.id, r.name]));

		return users.map((user) => ({
			...user,
			roles: (userRoles ?? [])
				.filter((ur) => ur.userId === user.id)
				.map((ur) => roleNameById.get(ur.roleId))
				.filter((name): name is string => Boolean(name)),
		}));
	}, [users, roles, userRoles]);

	const columns = [tUser("AppUserName"), tRole("AppRoles")];

	const rows = data.map((item) => ({
		id: item.id,
		cells: [item.username, item.roles.join(", ") || "-"],
	}));

	return (
		<ListPageWrapper title={tUser("AppUsers")}>
			<ErrorBanner error={error} variant="page" />
			<DataTable columns={columns} rows={rows} />
		</ListPageWrapper>
	);
}
