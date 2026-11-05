using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace App.DAL.EF.Migrations
{
    /// <inheritdoc />
    public partial class InventoryReworkTagsPhotosAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasPhoto",
                table: "Assets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAuditAt",
                table: "Assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastAuditBy",
                table: "Assets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Assets",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Visibility",
                table: "Assets",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "Normal");

            migrationBuilder.CreateTable(
                name: "AssetPhotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<byte[]>(type: "bytea", nullable: false),
                    ContentType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetPhotos_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TagName = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AssetTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ChangedBy = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    SysNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetTags_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssetTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Slug",
                table: "Assets",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetPhotos_AssetId",
                table: "AssetPhotos",
                column: "AssetId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetTags_AssetId_TagId",
                table: "AssetTags",
                columns: new[] { "AssetId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetTags_TagId",
                table: "AssetTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_TagName",
                table: "Tags",
                column: "TagName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssetPhotos");

            migrationBuilder.DropTable(
                name: "AssetTags");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Assets_Slug",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "HasPhoto",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "LastAuditAt",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "LastAuditBy",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Assets");
        }
    }
}
