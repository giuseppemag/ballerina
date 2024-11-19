using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace migrations.Migrations
{
    /// <inheritdoc />
    public partial class AddABSampleEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ABs",
                columns: table => new
                {
                    ABId = table.Column<Guid>(type: "uuid", nullable: false),
                    ACount = table.Column<int>(type: "integer", nullable: false),
                    BCount = table.Column<int>(type: "integer", nullable: false),
                    AFailCount = table.Column<int>(type: "integer", nullable: false),
                    BFailCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ABs", x => x.ABId);
                });

            migrationBuilder.CreateTable(
                name: "ABEvents",
                columns: table => new
                {
                    ABEventId = table.Column<Guid>(type: "uuid", nullable: false),
                    abevent_type = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    ABId = table.Column<Guid>(type: "uuid", nullable: true),
                    BEvent_ABId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ABEvents", x => x.ABEventId);
                    table.ForeignKey(
                        name: "FK_ABEvents_ABs_ABId",
                        column: x => x.ABId,
                        principalTable: "ABs",
                        principalColumn: "ABId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ABEvents_ABs_BEvent_ABId",
                        column: x => x.BEvent_ABId,
                        principalTable: "ABs",
                        principalColumn: "ABId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ABEvents_ABId",
                table: "ABEvents",
                column: "ABId");

            migrationBuilder.CreateIndex(
                name: "IX_ABEvents_BEvent_ABId",
                table: "ABEvents",
                column: "BEvent_ABId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ABEvents");

            migrationBuilder.DropTable(
                name: "ABs");
        }
    }
}
