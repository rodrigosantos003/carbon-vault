﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Models;
using System.Reflection.Emit;
using Mono.TextTemplating;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Stripe;

namespace Carbon_Vault.Data
{
    public class Carbon_VaultContext : DbContext
    {
        public DbSet<Models.Account> Account { get; set; } = default!;
        public DbSet<Project> Projects { get; set; }
        public DbSet<CarbonCredit> CarbonCredits { get; set; }
        public DbSet<ProjectType> ProjectTypes { get; set; }
        public DbSet<UserEmissions> UserEmissions { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<ProjectFiles> ProjectFiles { get; set; }
        public DbSet<Ticket> Tickets { get; set; } = default!;
        public DbSet<TicketMessage> TicketMessages { get; set; } = default!;
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportFiles> ReportFiles { get; set; }
        public Carbon_VaultContext(DbContextOptions<Carbon_VaultContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Configura o modelo de dados para a aplicação, é chamado durante a inicialização do DbContext.
        /// Permite definir as regras de mapeamento entre as classes e as tabelas da base de dados, como definição de relações entre entidades, chaves primárias e estrangerias.
        /// </summary>
        /// <param name="modelBuilder">Objeto usado para configurar o modelo de dados.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relação entre Account e Projects
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Owner)
                .WithMany(a => a.Projects)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relação entre Account e Transactions
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Author)
                .WithMany(a => a.Tickets)
                .HasForeignKey(t => t.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            //Relação entre Account e Tickets
            modelBuilder.Entity<Report>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            // Relação entre Project e ProjectType
            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.Project)
                .WithMany(p => p.CarbonCredits)
                .HasForeignKey(cc => cc.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relação entre Project e ProjectType
            modelBuilder.Entity<ProjectFiles>()
                .HasOne(pf => pf.Project)
                .WithMany(p => p.Files)
                .HasForeignKey(pf => pf.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relação entre ProjectType e Project
            modelBuilder.Entity<ReportFiles>()
                .HasOne(rf => rf.Report)
                .WithMany(r => r.Files)
                .HasForeignKey(rf => rf.ReportId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relação entre ProjectType e Project
            modelBuilder.Entity<TicketMessage>()
                .HasOne(tm => tm.Ticket)
                .WithMany(t => t.Messages)
                .HasForeignKey(tm => tm.TicketId)
                 .OnDelete(DeleteBehavior.NoAction);

            PopulateAccounts(modelBuilder);

            PopulateProjectTypes(modelBuilder);

            PopulateProjects(modelBuilder);

            PopulateTransactions(modelBuilder);

            PopulateCredits(modelBuilder);
        }

        /// <summary>
        /// Método que faz a população de Contas
        /// </summary>
        /// <param name="modelBuilder"></param>
        private static void PopulateAccounts(ModelBuilder modelBuilder)
        {
            string admin_hashed = AuthHelper.HashPassword("Admin@123");
            string user1_hashed = AuthHelper.HashPassword("User@111");
            string user2_hashed = AuthHelper.HashPassword("User@222");
            string user3_hashed = AuthHelper.HashPassword("User@333");
            string support_hashed = AuthHelper.HashPassword("Support@123");

            modelBuilder.Entity<Models.Account>().HasData(
                new Models.Account
                {
                    Id = 1,
                    Name = "Administrador",
                    Email = "admin@carbonvault.com",
                    Password = admin_hashed,
                    Nif = "123456789",
                    State = AccountState.Active,
                    Role = Models.AccountType.Admin,
                    CreatedAt = DateTime.UtcNow,

                },
                new Models.Account
                {
                    Id = 2,
                    Name = "Utilizador Comum",
                    Email = "user@carbonvault.com",
                    Password = user1_hashed,
                    Nif = "987654321",
                    State = AccountState.Active,
                    Role = Models.AccountType.User,
                    CreatedAt = DateTime.UtcNow
                },
                new Models.Account
                {
                    Id = 3,
                    Name = "John Smith",
                    Email = "support@carbonvault.com",
                    Password = support_hashed,
                    Nif = "333333333",
                    State = AccountState.Active,
                    Role = Models.AccountType.Support,
                    CreatedAt = DateTime.UtcNow
                },
                new Models.Account
                {
                    Id = 4,
                    Name = "My User",
                    Email = "user2@carbonvault.com",
                    Password = user2_hashed,
                    Nif = "444444444",
                    State = AccountState.Active,
                    Role = Models.AccountType.User,
                    CreatedAt = DateTime.UtcNow
                },
                new Models.Account
                {
                    Id = 5,
                    Name = "Jane Doe",
                    Email = "Evaluator@carbonvault.com",
                    Password = user3_hashed,
                    Nif = "555555555",
                    State = AccountState.Active,
                    Role = Models.AccountType.Evaluator,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }

        // Método que faz a população dos tipos de projetos
        private static void PopulateProjectTypes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProjectType>().HasData(
               new ProjectType { Id = 1, Type = ProjectTypeEnum.Poverty },
               new ProjectType { Id = 2, Type = ProjectTypeEnum.Hunger },
               new ProjectType { Id = 3, Type = ProjectTypeEnum.Health },
               new ProjectType { Id = 4, Type = ProjectTypeEnum.Education },
               new ProjectType { Id = 5, Type = ProjectTypeEnum.Gender },
               new ProjectType { Id = 6, Type = ProjectTypeEnum.Water },
               new ProjectType { Id = 7, Type = ProjectTypeEnum.Energy },
               new ProjectType { Id = 8, Type = ProjectTypeEnum.Work },
               new ProjectType { Id = 9, Type = ProjectTypeEnum.Industry },
               new ProjectType { Id = 10, Type = ProjectTypeEnum.WaterLife },
               new ProjectType { Id = 11, Type = ProjectTypeEnum.LandLife },
               new ProjectType { Id = 12, Type = ProjectTypeEnum.Peace },
               new ProjectType { Id = 13, Type = ProjectTypeEnum.Partnership }
           );
        }

        /// <summary>
        /// Método que faz a população dos Projetos
        /// </summary>
        /// <param name="modelBuilder"></param>
        private static void PopulateProjects(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>().HasData(
               new Project
               {
                   Id = 1,
                   Name = "Water Access Initiative",
                   Description = "Providing clean water access to rural communities.",
                   Location = "Africa",
                   CarbonCreditsGenerated = 1000,
                   StartDate = DateTime.Now.AddMonths(-3),
                   EndDate = DateTime.Now.AddMonths(12),
                   Developer = "Green Solutions",
                   Certification = "ISO 14001",
                   PricePerCredit = 12.50M,
                   CreatedAt = DateTime.UtcNow,
                   Status = ProjectStatus.Confirmed,
                   benefits = "Providing clean water access to rural communities.",
                   OwnerId = 4,
                   ProjectUrl = new Uri("https://example.com/project1"),
                   ImageUrl = "https://api.hub.jhu.edu/factory/sites/default/files/styles/hub_large/public/drink-more-water-hub.jpg",
                   IsForSale = true,
               },
               new Project
               {
                   Id = 2,
                   Name = "Solar Energy for All",
                   Description = "Solar energy projects to provide electricity to underserved areas.",
                   Location = "South America",
                   CarbonCreditsGenerated = 2000,
                   StartDate = DateTime.Now.AddMonths(-1),
                   EndDate = DateTime.Now.AddMonths(24),
                   Developer = "Renewable Power Inc.",
                   Certification = "LEED Gold",
                   OwnerId = 2,
                   benefits = "Solar energy projects to provide electricity to underserved areas.",
                   PricePerCredit = 15.75M,
                   Status = ProjectStatus.Confirmed,
                   ProjectUrl = new Uri("https://example.com/project2"),
                   CreatedAt = DateTime.UtcNow,
                   ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS2nF0iroOXheUgLiCRjKPFEyxqBqbjMMiBZxtPvybNA14VsZrFMg2wgudNFFSgdW9S5Q&usqp=CAU",
                   IsForSale = true,
               }
           );
        }

        /// <summary>
        /// Método que faz a população das Transações
        /// </summary>
        /// <param name="modelBuilder"></param>
        private static void PopulateTransactions(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Transaction>().HasData(
                new Transaction
                {
                    Id = 1,
                    BuyerId = 2,
                    SellerId = 4,
                    ProjectId = 1,
                    BuyerName = "Utilizador Comum",
                    SellerName = "My User",
                    ProjectName = "Water Access Initiative",
                    ProjectLocation = "-2,2",
                    ProjectDescription = "AAAAA",
                    ProjectCertifier = "Gold Standard",
                    Quantity = 1,
                    TotalPrice = 12.50,
                    Date = "2025-03-05",
                    State = TransactionState.Approved,
                    PaymentMethod = "Cartão",
                    CheckoutSession = "cs_123456789"
                },
                new Transaction
                {
                    Id = 2,
                    SellerId = 4,
                    BuyerId = 5,
                    ProjectId = 2,
                    BuyerName = "My User",
                    SellerName = "John Smith",
                    ProjectName = "Water Access Initiative",
                    ProjectLocation = "-1,1",
                    ProjectDescription = "AAAAA",
                    ProjectCertifier = "Gold Standard",
                    Quantity = 1,
                    TotalPrice = 15.75,
                    Date = "2025-03-05",
                    State = TransactionState.Approved,
                    PaymentMethod = "Transferência Bancária",
                    CheckoutSession = "cs_987456321"
                }
            );
        }

        /// <summary>
        /// Método que faz a população de Créditos de Carbono
        /// </summary>
        /// <param name="modelBuilder"></param>
        private static void PopulateCredits(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CarbonCredit>().HasData(
                new CarbonCredit
                {
                    Id = 1,
                    ProjectId = 2,
                    IsSold = false,
                    Price = 15.75M,
                    Certification = "ISO 14001",
                    SerialNumber = "123456789",
                },
                new CarbonCredit
                {
                    Id = 2,
                    ProjectId = 2,
                    IsSold = false,
                    Price = 15.75M,
                    Certification = "ISO 14001",
                    SerialNumber = "123456789",
                },
                new CarbonCredit
                {
                    Id = 3,
                    ProjectId = 2,
                    IsSold = false,
                    Price = 15.75M,
                    Certification = "ISO 14001",
                    SerialNumber = "123456789",
                },
                new CarbonCredit
                {
                    Id = 4,
                    ProjectId = 2,
                    IsSold = false,
                    Price = 15.75M,
                    Certification = "ISO 14001",
                    SerialNumber = "123456789",
                },
                new CarbonCredit
                {
                    Id = 5,
                    ProjectId = 2,
                    IsSold = false,
                    Price = 15.75M,
                    Certification = "ISO 14001",
                    SerialNumber = "123456789",
                }
            );
        }
    }
}