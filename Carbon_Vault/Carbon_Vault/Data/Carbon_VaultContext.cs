using System;
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

        public Carbon_VaultContext (DbContextOptions<Carbon_VaultContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar o relacionamento entre Project e CarbonCredit
            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.Project)                     
                .WithMany(p => p.CarbonCredits)               
                .HasForeignKey(cc => cc.ProjectId)           
                .OnDelete(DeleteBehavior.Cascade);

            populateAccounts(modelBuilder);

            populateProjectTypes(modelBuilder);

            populateProjects(modelBuilder);

            populateTransactions(modelBuilder);
        }
        
        private void populateAccounts(ModelBuilder modelBuilder)
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
                    Name = "André Castanho",
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
                    Name = "John Doe",
                    Email = "user1@carbonvault.com",
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
                    Email = "user3@carbonvault.com",
                    Password = user3_hashed,
                    Nif = "555555555",
                    State = AccountState.Active,
                    Role = Models.AccountType.User,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }

        private void populateProjectTypes(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProjectType>().HasData(
               new ProjectType
               {
                   Id = 1,
                   Type = ProjectTypeEnum.Poverty
               },
               new ProjectType
               {
                   Id = 2,
                   Type = ProjectTypeEnum.Hunger
               },
               new ProjectType
               {
                   Id = 3,
                   Type = ProjectTypeEnum.Health
               }
           );
        }

        private void populateProjects(ModelBuilder modelBuilder)
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

                   Status = ProjectStatus.Confirmed,
                   Benefits = "Access to clean water, improved health conditions.",
                   ProjectUrl = new Uri("https://example.com/project1"),
                   ImageUrl = "https://api.hub.jhu.edu/factory/sites/default/files/styles/hub_large/public/drink-more-water-hub.jpg"
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
                   PricePerCredit = 15.75M,
                   Status = ProjectStatus.Confirmed,
                   Benefits = "Sustainable energy solutions, reduced carbon emissions.",
                   ProjectUrl = new Uri("https://example.com/project2"),
                   ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS2nF0iroOXheUgLiCRjKPFEyxqBqbjMMiBZxtPvybNA14VsZrFMg2wgudNFFSgdW9S5Q&usqp=CAU"
               }
           );
        }

        private void populateTransactions(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Transaction>().HasData(
                new Transaction
                {
                    Id = 1,
                    Type = TransactionType.Purchase,
                    UserId = 2,
                    ProjectId = 1,
                    Quantity = 1,
                    Date = "2025-03-05",
                    State = TransactionState.Approved,
                    PaymentMethod = "card",
                    CheckoutSession = "cs_123456789"
                },
                new Transaction
                {
                    Id = 2,
                    Type = TransactionType.Sale,
                    UserId = 2,
                    ProjectId = 2,
                    Quantity = 1,
                    Date = "2025-03-05",
                    State = TransactionState.Approved,
                    PaymentMethod = "card",
                    CheckoutSession = "cs_987456321"
                }
            );
        }
    }
}
