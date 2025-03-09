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

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("LastLogin")
                        .HasColumnType("datetime2");

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

                    b.HasData(
                        new
                        {
                            Id = 1,
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(6619),
                            Email = "admin@carbonvault.com",
                            LastLogin = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Administrador",
                            Nif = "123456789",
                            Password = "7wuF8hhP0Ag+pqJi/mizJacALJdEiNDqkDzCZTIaJYLsLdRo86fKYDH8EKur0TDW",
                            Role = 1,
                            State = 1
                        },
                        new
                        {
                            Id = 2,
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(6623),
                            Email = "user@carbonvault.com",
                            LastLogin = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Utilizador Comum",
                            Nif = "987654321",
                            Password = "QGuneNvXtyRJ8uLBP1Cja/juaD7gkxfY7eYxu/f5aOyjVUw5qxt0tq2+b9TQ2RcC",
                            Role = 0,
                            State = 1
                        },
                        new
                        {
                            Id = 3,
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(6624),
                            Email = "support@carbonvault.com",
                            LastLogin = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "John Smith",
                            Nif = "333333333",
                            Password = "PvJL/uYtlII8tbLnq5LJuwsNo1LBoDykYsGK+XfGhxNhuFptnb4+7Ztgu+2RFMI6",
                            Role = 3,
                            State = 1
                        },
                        new
                        {
                            Id = 4,
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(6626),
                            Email = "user2@carbonvault.com",
                            LastLogin = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "My User",
                            Nif = "444444444",
                            Password = "54n604bZtAkShyCpyWoVZ1aEYMPC+CfvLXPQvDuKOZsJpY/AHuAS94Ynq0ZoqMVD",
                            Role = 0,
                            State = 1
                        },
                        new
                        {
                            Id = 5,
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(6627),
                            Email = "user3@carbonvault.com",
                            LastLogin = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Jane Doe",
                            Nif = "555555555",
                            Password = "NVj63MrQZ8kL4ULuk2MGxj+sVXJx43QlBeOVr6ueRSuKW5lhGsv/2MiOvTEYhT8a",
                            Role = 0,
                            State = 1
                        });
                });

            modelBuilder.Entity("Carbon_Vault.Models.CarbonCredit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("BuyerId")
                        .HasColumnType("int");

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

                    b.Property<string>("SerialNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("BuyerId");

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

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

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
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(7051),
                            Description = "Providing clean water access to rural communities.",
                            Developer = "Green Solutions",
                            EndDate = new DateTime(2026, 3, 8, 16, 3, 16, 449, DateTimeKind.Local).AddTicks(7046),
                            ImageUrl = "https://api.hub.jhu.edu/factory/sites/default/files/styles/hub_large/public/drink-more-water-hub.jpg",
                            Location = "Africa",
                            Name = "Water Access Initiative",
                            PricePerCredit = 12.50m,
                            ProjectUrl = "https://example.com/project1",
                            StartDate = new DateTime(2024, 12, 8, 16, 3, 16, 449, DateTimeKind.Local).AddTicks(6996),
                            Status = 0
                        },
                        new
                        {
                            Id = 2,
                            Benefits = "Sustainable energy solutions, reduced carbon emissions.",
                            CarbonCreditsGenerated = 2000.0,
                            Certification = "LEED Gold",
                            CreatedAt = new DateTime(2025, 3, 8, 16, 3, 16, 449, DateTimeKind.Utc).AddTicks(7146),
                            Description = "Solar energy projects to provide electricity to underserved areas.",
                            Developer = "Renewable Power Inc.",
                            EndDate = new DateTime(2027, 3, 8, 16, 3, 16, 449, DateTimeKind.Local).AddTicks(7137),
                            ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS2nF0iroOXheUgLiCRjKPFEyxqBqbjMMiBZxtPvybNA14VsZrFMg2wgudNFFSgdW9S5Q&usqp=CAU",
                            Location = "South America",
                            Name = "Solar Energy for All",
                            PricePerCredit = 15.75m,
                            ProjectUrl = "https://example.com/project2",
                            StartDate = new DateTime(2025, 2, 8, 16, 3, 16, 449, DateTimeKind.Local).AddTicks(7134),
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

            modelBuilder.Entity("Carbon_Vault.Models.Transaction", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("CheckoutSession")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Date")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PaymentMethod")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ProjectId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int>("State")
                        .HasColumnType("int");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Transactions");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            CheckoutSession = "cs_123456789",
                            Date = "2025-03-05",
                            PaymentMethod = "card",
                            ProjectId = 1,
                            Quantity = 1,
                            State = 0,
                            Type = 0,
                            UserId = 2
                        },
                        new
                        {
                            Id = 2,
                            CheckoutSession = "cs_987456321",
                            Date = "2025-03-05",
                            PaymentMethod = "card",
                            ProjectId = 2,
                            Quantity = 1,
                            State = 0,
                            Type = 1,
                            UserId = 2
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
                    b.HasOne("Carbon_Vault.Models.Account", "Buyer")
                        .WithMany()
                        .HasForeignKey("BuyerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Carbon_Vault.Models.Project", "Project")
                        .WithMany("CarbonCredits")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Buyer");

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
