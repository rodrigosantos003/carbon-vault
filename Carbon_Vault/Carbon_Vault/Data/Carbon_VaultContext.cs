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
    }
}
