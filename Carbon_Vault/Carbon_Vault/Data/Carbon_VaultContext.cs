using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Models;

namespace Carbon_Vault.Data
{
    public class Carbon_VaultContext : DbContext
    {
        public Carbon_VaultContext (DbContextOptions<Carbon_VaultContext> options)
            : base(options)
        {
        }


        public DbSet<Carbon_Vault.Models.Account> Account { get; set; } = default!;
        public DbSet<Carbon_Vault.Models.Project> Projects { get; set; }
        public DbSet<Carbon_Vault.Models.CarbonCredit> CarbonCredits { get; set; }
        public DbSet<Carbon_Vault.Models.ProjectType> ProjectTypes { get; set; }

        public DbSet<Carbon_Vault.Models.UserEmissions> UserEmissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar o relacionamento entre Project e CarbonCredit
            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.Project)                     
                .WithMany(p => p.CarbonCredits)               
                .HasForeignKey(cc => cc.ProjectId)           
                .OnDelete(DeleteBehavior.Cascade);



            


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
