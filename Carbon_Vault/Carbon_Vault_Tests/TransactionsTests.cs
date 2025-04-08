using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Carbon_Vault_Tests_Transactions
{
    public class TransactionsTests : IDisposable
    {
        private readonly TransactionsController _controller;
        private readonly Carbon_VaultContext _context;

        public TransactionsTests()
        {
            Environment.SetEnvironmentVariable("JWT_KEY", "K1o+fi[9&-{F=y+}w:#6%30kCFM<FEo~");

            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            _context = new Carbon_VaultContext(options);
            _controller = new TransactionsController(_context);

            string hashed_pass = AuthHelper.HashPassword("User@123");

            _context.Account.AddRange(new List<Account>
                        {
                            new Account { Id = 1, Name = "Admin User", Email = "admin@example.com", Role = AccountType.Admin, State = AccountState.Active, Nif = "12345678", Password = hashed_pass },
                            new Account { Id = 2, Name = "Support User", Email = "support@example.com", Role = AccountType.Support, State = AccountState.Active, Nif = "12345678", Password = hashed_pass },
                            new Account { Id = 3, Name = "Regular User", Email = "user@example.com", Role = AccountType.User, State = AccountState.Active, Nif = "12345678", Password = hashed_pass }
                        });
        }

        [Fact]
        public async Task PostTransaction_Success_ReturnsCreatedAtAction()
        {
            // Arrange
            var transaction = new Transaction
            {
                Id = 10,
                BuyerId = 2,
                SellerId = 4,
                ProjectId = 1,
                Quantity = 1,
                TotalPrice = 12.50,
                Date = "2025-03-27",
                State = TransactionState.Approved,
                PaymentMethod = "card",
                CheckoutSession = "cs_123452789",
                BuyerName = "User Teste",
                SellerName = "Teste User",
                ProjectName = "Test Project",
                ProjectCertifier = "Gold Standard",
                ProjectDescription = "Description",
                ProjectLocation = "Location"
            };

            // Act
            var result = await _controller.PostTransaction(transaction);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetTransaction", createdResult.ActionName);
            Assert.Equal(transaction, createdResult.Value);
        }

        [Fact]
        public async Task DeleteTransaction_Success_ReturnsOk()
        {
            // Arrange

            int userId = 3;
            var account = await _context.Account.FindAsync(userId);
            string userToken = AuthHelper.GerarToken(account);
            string validToken = "Bearer " + userToken;

            var transaction = new Transaction
            {
                Id = 10,
                BuyerId = 2,
                SellerId = userId,
                ProjectId = 1,
                Quantity = 1,
                TotalPrice = 12.50,
                Date = "2025-03-27",
                State = TransactionState.Approved,
                PaymentMethod = "card",
                CheckoutSession = "cs_123452789",
                BuyerName = "User Teste",
                SellerName = "Teste User",
                ProjectName = "Test Project",
                ProjectCertifier = "Gold Standard",
                ProjectDescription = "Description",
                ProjectLocation = "Location"
            };

            await _controller.PostTransaction(transaction);

            // Act
            var result = await _controller.DeleteTransaction(transaction.Id);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}