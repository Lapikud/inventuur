using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.DAL.EF.Migrations
{
    /// <inheritdoc />
    public partial class FlattenLocationHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add the new columns as nullable first — backfill needs them.
            migrationBuilder.AddColumn<Guid>(
                name: "CupboardId",
                table: "Locations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "Locations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "Cupboards",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LocationId",
                table: "Assets",
                type: "uuid",
                nullable: true);

            // 2. Backfill from the junction tables BEFORE dropping them:
            //    one placement per entity was the de-facto model all along
            //    (every query did .First()), so take the oldest link.
            migrationBuilder.Sql(@"
UPDATE ""Cupboards"" c
SET ""RoomId"" = (
    SELECT cir.""RoomId"" FROM ""CupboardsInRooms"" cir
    WHERE cir.""CupboardId"" = c.""Id""
    ORDER BY cir.""CreatedAt"" LIMIT 1);");

            migrationBuilder.Sql(@"
UPDATE ""Locations"" l
SET ""CupboardId"" = (
    SELECT lic.""CupboardId"" FROM ""LocationsInCupboards"" lic
    WHERE lic.""LocationId"" = l.""Id""
    ORDER BY lic.""CreatedAt"" LIMIT 1);");

            migrationBuilder.Sql(@"
UPDATE ""Locations"" l
SET ""RoomId"" = c.""RoomId""
FROM ""Cupboards"" c
WHERE c.""Id"" = l.""CupboardId"";");

            // Safety net: anything that could not be resolved (shouldn't
            // happen in a consistently-used database) lands in the oldest
            // room so the NOT NULL constraints below cannot fail mid-flight.
            migrationBuilder.Sql(@"
UPDATE ""Cupboards"" SET ""RoomId"" = (SELECT min(r.""Id""::text)::uuid FROM ""Rooms"" r) WHERE ""RoomId"" IS NULL;
UPDATE ""Locations"" SET ""RoomId"" = (SELECT min(r.""Id""::text)::uuid FROM ""Rooms"" r) WHERE ""RoomId"" IS NULL;");

            migrationBuilder.Sql(@"
UPDATE ""Assets"" a
SET ""LocationId"" = (
    SELECT la.""LocationId"" FROM ""LocationAssetsCollection"" la
    WHERE la.""AssetId"" = a.""Id""
    ORDER BY la.""CreatedAt"" LIMIT 1);");

            // 3. Tighten the required columns.
            migrationBuilder.AlterColumn<Guid>(
                name: "RoomId",
                table: "Locations",
                type: "uuid",
                nullable: false);

            migrationBuilder.AlterColumn<Guid>(
                name: "RoomId",
                table: "Cupboards",
                type: "uuid",
                nullable: false);

            // 4. Indexes and foreign keys for the direct placement columns.
            migrationBuilder.CreateIndex(
                name: "IX_Locations_CupboardId",
                table: "Locations",
                column: "CupboardId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_LocationName",
                table: "Locations",
                column: "LocationName");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_RoomId",
                table: "Locations",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Cupboards_CodeName",
                table: "Cupboards",
                column: "CodeName");

            migrationBuilder.CreateIndex(
                name: "IX_Cupboards_RoomId",
                table: "Cupboards",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_LocationId",
                table: "Assets",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Locations_LocationId",
                table: "Assets",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cupboards_Rooms_RoomId",
                table: "Cupboards",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Cupboards_CupboardId",
                table: "Locations",
                column: "CupboardId",
                principalTable: "Cupboards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Rooms_RoomId",
                table: "Locations",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 5. Only now can the junction tables go — their data lives in
            //    the direct foreign keys above.
            migrationBuilder.DropTable(
                name: "CupboardsInRooms");

            migrationBuilder.DropTable(
                name: "LocationAssetsCollection");

            migrationBuilder.DropTable(
                name: "LocationsInCupboards");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Locations_LocationId",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Cupboards_Rooms_RoomId",
                table: "Cupboards");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Cupboards_CupboardId",
                table: "Locations");

            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Rooms_RoomId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_CupboardId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_LocationName",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_RoomId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Cupboards_CodeName",
                table: "Cupboards");

            migrationBuilder.DropIndex(
                name: "IX_Cupboards_RoomId",
                table: "Cupboards");

            migrationBuilder.DropIndex(
                name: "IX_Assets_LocationId",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "CupboardId",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "Cupboards");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "Assets");

            migrationBuilder.CreateTable(
                name: "CupboardsInRooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CupboardId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoomId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Comment = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CupboardsInRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CupboardsInRooms_Cupboards_CupboardId",
                        column: x => x.CupboardId,
                        principalTable: "Cupboards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CupboardsInRooms_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LocationAssetsCollection",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationAssetsCollection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocationAssetsCollection_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LocationAssetsCollection_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LocationsInCupboards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CupboardId = table.Column<Guid>(type: "uuid", nullable: false),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationsInCupboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocationsInCupboards_Cupboards_CupboardId",
                        column: x => x.CupboardId,
                        principalTable: "Cupboards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LocationsInCupboards_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CupboardsInRooms_CupboardId_RoomId",
                table: "CupboardsInRooms",
                columns: new[] { "CupboardId", "RoomId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CupboardsInRooms_RoomId",
                table: "CupboardsInRooms",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationAssetsCollection_AssetId",
                table: "LocationAssetsCollection",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationAssetsCollection_LocationId_AssetId",
                table: "LocationAssetsCollection",
                columns: new[] { "LocationId", "AssetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LocationsInCupboards_CupboardId",
                table: "LocationsInCupboards",
                column: "CupboardId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationsInCupboards_LocationId_CupboardId",
                table: "LocationsInCupboards",
                columns: new[] { "LocationId", "CupboardId" },
                unique: true);
        }
    }
}
