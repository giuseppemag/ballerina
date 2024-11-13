﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace migrations.Migrations
{
    [DbContext(typeof(BloggingContext))]
    partial class BloggingContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.10")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Blogs.Blog", b =>
                {
                    b.Property<Guid>("BlogId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Url")
                        .HasColumnType("text");

                    b.HasKey("BlogId");

                    b.ToTable("Blogs");
                });

            modelBuilder.Entity("Blogs.Post", b =>
                {
                    b.Property<Guid>("PostId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("BlogId")
                        .HasColumnType("uuid");

                    b.Property<string>("Content")
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.HasKey("PostId");

                    b.HasIndex("BlogId");

                    b.ToTable("Posts");
                });

            modelBuilder.Entity("Blogs.Tag", b =>
                {
                    b.Property<Guid>("TagId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid?>("BlogId")
                        .HasColumnType("uuid");

                    b.Property<string>("tag_type")
                        .IsRequired()
                        .HasMaxLength(13)
                        .HasColumnType("character varying(13)");

                    b.HasKey("TagId");

                    b.HasIndex("BlogId");

                    b.ToTable("Tags");

                    b.HasDiscriminator<string>("tag_type").HasValue("Tag");

                    b.UseTphMappingStrategy();
                });

            modelBuilder.Entity("Users+Token", b =>
                {
                    b.Property<Guid>("TokenId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Token")
                        .HasColumnType("text");

                    b.HasKey("TokenId");

                    b.ToTable("Token");
                });

            modelBuilder.Entity("Users+User", b =>
                {
                    b.Property<Guid>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<bool>("Active")
                        .HasColumnType("boolean");

                    b.Property<string>("Email")
                        .HasColumnType("text");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("text");

                    b.HasKey("UserId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Users+UserEvent", b =>
                {
                    b.Property<Guid>("UserEventId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("user_event_type")
                        .IsRequired()
                        .HasMaxLength(21)
                        .HasColumnType("character varying(21)");

                    b.HasKey("UserEventId");

                    b.ToTable("UserEvents");

                    b.HasDiscriminator<string>("user_event_type").HasValue("UserEvent");

                    b.UseTphMappingStrategy();
                });

            modelBuilder.Entity("Blogs.Interview", b =>
                {
                    b.HasBaseType("Blogs.Tag");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Surname")
                        .HasColumnType("text");

                    b.HasDiscriminator().HasValue("Interview");
                });

            modelBuilder.Entity("Blogs.Lifestyle", b =>
                {
                    b.HasBaseType("Blogs.Tag");

                    b.HasDiscriminator().HasValue("Lifestyle");
                });

            modelBuilder.Entity("Users+EmailConfirmedEvent", b =>
                {
                    b.HasBaseType("Users+UserEvent");

                    b.Property<string>("Email")
                        .HasColumnType("text");

                    b.Property<Guid>("TokenId")
                        .HasColumnType("uuid");

                    b.HasIndex("TokenId");

                    b.ToTable("UserEvents", t =>
                        {
                            t.Property("Email")
                                .HasColumnName("EmailConfirmedEvent_Email");
                        });

                    b.HasDiscriminator().HasValue("EmailConfirmedEvent");
                });

            modelBuilder.Entity("Users+NewUserEvent", b =>
                {
                    b.HasBaseType("Users+UserEvent");

                    b.Property<string>("Email")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.HasDiscriminator().HasValue("NewUserEvent");
                });

            modelBuilder.Entity("Blogs.Post", b =>
                {
                    b.HasOne("Blogs.Blog", "Blog")
                        .WithMany("Posts")
                        .HasForeignKey("BlogId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Blog");
                });

            modelBuilder.Entity("Blogs.Tag", b =>
                {
                    b.HasOne("Blogs.Blog", null)
                        .WithMany("Tags")
                        .HasForeignKey("BlogId");
                });

            modelBuilder.Entity("Users+EmailConfirmedEvent", b =>
                {
                    b.HasOne("Users+Token", "Token")
                        .WithMany()
                        .HasForeignKey("TokenId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Token");
                });

            modelBuilder.Entity("Blogs.Blog", b =>
                {
                    b.Navigation("Posts");

                    b.Navigation("Tags");
                });
#pragma warning restore 612, 618
        }
    }
}