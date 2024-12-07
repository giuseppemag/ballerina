using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace migrations.Migrations
{
    /// <inheritdoc />
    public partial class Setup : Migration
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
                name: "Token",
                columns: table => new
                {
                    TokenId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Token", x => x.TokenId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "ABEvents",
                columns: table => new
                {
                    ABEventId = table.Column<Guid>(type: "uuid", nullable: false),
                    ABId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessingStatus = table.Column<int>(type: "integer", nullable: false),
                    abevent_type = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    AStep = table.Column<int>(type: "integer", nullable: true),
                    BStep = table.Column<int>(type: "integer", nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "UserEvents",
                columns: table => new
                {
                    UserEventId = table.Column<Guid>(type: "uuid", nullable: false),
                    user_event_type = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    EmailConfirmedEvent_Email = table.Column<string>(type: "text", nullable: true),
                    TokenId = table.Column<Guid>(type: "uuid", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Password = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvents", x => x.UserEventId);
                    table.ForeignKey(
                        name: "FK_UserEvents_Token_TokenId",
                        column: x => x.TokenId,
                        principalTable: "Token",
                        principalColumn: "TokenId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ABEvents_ABId",
                table: "ABEvents",
                column: "ABId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvents_TokenId",
                table: "UserEvents",
                column: "TokenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ABEvents");

            migrationBuilder.DropTable(
                name: "UserEvents");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ABs");

            migrationBuilder.DropTable(
                name: "Token");
        }
    }
}
