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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar o relacionamento entre Project e CarbonCredit
            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.Project)                     
                .WithMany(p => p.CarbonCredits)               
                .HasForeignKey(cc => cc.ProjectId)           
                .OnDelete(DeleteBehavior.Cascade);
        }
        public DbSet<Carbon_Vault.Models.UserEmissions> UserEmissions { get; set; }
    }
}
