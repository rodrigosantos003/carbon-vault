﻿// <auto-generated />
using System;
using Carbon_Vault.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Carbon_Vault.Migrations
{
    [DbContext(typeof(Carbon_VaultContext))]
    partial class Carbon_VaultContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Carbon_Vault.Models.Account", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Nif")
                        .IsRequired()
                        .HasMaxLength(9)
                        .HasColumnType("nvarchar(9)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Role")
                        .HasColumnType("int");

                    b.Property<int>("State")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Account");
                });

            modelBuilder.Entity("Carbon_Vault.Models.CarbonCredit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Buyer")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Certification")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("ExpiryDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsSold")
                        .HasColumnType("bit");

                    b.Property<DateTime>("IssueDate")
                        .HasColumnType("datetime2");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("ProjectId")
                        .HasColumnType("int");

                    b.Property<double>("Quantity")
                        .HasColumnType("float");

                    b.Property<string>("SerialNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.ToTable("CarbonCredits");
                });

            modelBuilder.Entity("Carbon_Vault.Models.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Benefits")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("CarbonCreditsGenerated")
                        .HasColumnType("float");

                    b.Property<string>("Certification")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Developer")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("PricePerCredit")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ProjectUrl")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Projects");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Benefits = "Access to clean water, improved health conditions.",
                            CarbonCreditsGenerated = 1000.0,
                            Certification = "ISO 14001",
                            Description = "Providing clean water access to rural communities.",
                            Developer = "Green Solutions",
                            EndDate = new DateTime(2026, 2, 9, 17, 55, 14, 543, DateTimeKind.Local).AddTicks(9840),
                            ImageUrl = "https://example.com/image1.jpg",
                            Location = "Africa",
                            Name = "Water Access Initiative",
                            PricePerCredit = 12.50m,
                            ProjectUrl = "https://example.com/project1",
                            StartDate = new DateTime(2024, 11, 9, 17, 55, 14, 543, DateTimeKind.Local).AddTicks(9787),
                            Status = 0
                        },
                        new
                        {
                            Id = 2,
                            Benefits = "Sustainable energy solutions, reduced carbon emissions.",
                            CarbonCreditsGenerated = 2000.0,
                            Certification = "LEED Gold",
                            Description = "Solar energy projects to provide electricity to underserved areas.",
                            Developer = "Renewable Power Inc.",
                            EndDate = new DateTime(2027, 2, 9, 17, 55, 14, 543, DateTimeKind.Local).AddTicks(9929),
                            ImageUrl = "https://example.com/image2.jpg",
                            Location = "South America",
                            Name = "Solar Energy for All",
                            PricePerCredit = 15.75m,
                            ProjectUrl = "https://example.com/project2",
                            StartDate = new DateTime(2025, 1, 9, 17, 55, 14, 543, DateTimeKind.Local).AddTicks(9927),
                            Status = 0
                        });
                });

            modelBuilder.Entity("Carbon_Vault.Models.ProjectType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("ProjectTypes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Type = 0
                        },
                        new
                        {
                            Id = 2,
                            Type = 1
                        },
                        new
                        {
                            Id = 3,
                            Type = 2
                        });
                });

            modelBuilder.Entity("Carbon_Vault.Models.UserEmissions", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.Property<double>("diesel")
                        .HasColumnType("float");

                    b.Property<double>("electricity")
                        .HasColumnType("float");

                    b.Property<double>("petrol")
                        .HasColumnType("float");

                    b.HasKey("Id");

                    b.ToTable("UserEmissions");
                });

            modelBuilder.Entity("ProjectProjectType", b =>
                {
                    b.Property<int>("ProjectsId")
                        .HasColumnType("int");

                    b.Property<int>("TypesId")
                        .HasColumnType("int");

                    b.HasKey("ProjectsId", "TypesId");

                    b.HasIndex("TypesId");

                    b.ToTable("ProjectProjectType");
                });

            modelBuilder.Entity("Carbon_Vault.Models.CarbonCredit", b =>
                {
                    b.HasOne("Carbon_Vault.Models.Project", "Project")
                        .WithMany("CarbonCredits")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Project");
                });

            modelBuilder.Entity("ProjectProjectType", b =>
                {
                    b.HasOne("Carbon_Vault.Models.Project", null)
                        .WithMany()
                        .HasForeignKey("ProjectsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Carbon_Vault.Models.ProjectType", null)
                        .WithMany()
                        .HasForeignKey("TypesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Carbon_Vault.Models.Project", b =>
                {
                    b.Navigation("CarbonCredits");
                });
#pragma warning restore 612, 618
        }
    }
}
