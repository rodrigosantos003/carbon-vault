using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Models;
using System.Reflection.Emit;

namespace Carbon_Vault.Data
{
    public class Carbon_VaultContext : DbContext
    {
        public DbSet<Account> Account { get; set; } = default!;
        public DbSet<Project> Projects { get; set; }
        public DbSet<CarbonCredit> CarbonCredits { get; set; }
        public DbSet<ProjectType> ProjectTypes { get; set; }
        public DbSet<UserEmissions> UserEmissions { get; set; }

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
        }
        
        private void populateAccounts(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>().HasData(
                new Account
                {
                    Id = 1,
                    Name = "André Castanho",
                    Email = "admin@carbonvault.com",
                    Password = "Andre@123",
                    Nif = "123456789",
                    State = AccountState.Active,
                    Role = AccountType.Admin,
                    CreatedAt = DateTime.UtcNow,
                },
                new Account
                {
                    Id = 2,
                    Name = "John Doe",
                    Email = "user2@carbonvault.com",
                    Password = "HashedPassword@123",
                    Nif = "987654321",
                    State = AccountState.Active,
                    Role = AccountType.User,
                    CreatedAt = DateTime.UtcNow
                },
                new Account
                {
                    Id = 3,
                    Name = "John Smith",
                    Email = "user3@carbonvault.com",
                    Password = "HashedPassword@123",
                    Nif = "333333333",
                    State = AccountState.Active,
                    Role = AccountType.Support,
                    CreatedAt = DateTime.UtcNow
                },
                new Account
                {
                    Id = 4,
                    Name = "My User",
                    Email = "user4@carbonvault.com",
                    Password = "HashedPassword@123",
                    Nif = "444444444",
                    State = AccountState.Active,
                    Role = AccountType.User,
                    CreatedAt = DateTime.UtcNow
                },
                new Account
                {
                    Id = 5,
                    Name = "Jane Doe",
                    Email = "user5@carbonvault.com",
                    Password = "HashedPassword@123",
                    Nif = "555555555",
                    State = AccountState.Active,
                    Role = AccountType.User,
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
                   ImageUrl = "https://example.com/image1.jpg"
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
                   ImageUrl = "https://example.com/image2.jpg"
               }
           );
        }
    }
}
