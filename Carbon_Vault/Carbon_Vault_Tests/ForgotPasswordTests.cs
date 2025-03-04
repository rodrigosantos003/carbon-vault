using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Carbon_Vault_Tests
{
    public class ForgotPasswordTests : IDisposable
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Carbon_VaultContext _mockContext;

        public ForgotPasswordTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();

            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            // Criar um contexto de base de dados InMemory
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Usa um GUID para criar uma BD única por teste
                .Options;

            _mockContext = new Carbon_VaultContext(options);
        }

        [Fact]
        public async Task ForgotPassword_AccountNotFound_ReturnsNotFound()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            // Act
            var result = await controller.ForgotPassword("nonexistent@example.com");

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Account not found.", notFoundResult.Value as string);
        }

        [Fact]
        public async Task ForgotPassword_ValidAccount_SendsEmailAndReturnsOk()
        {
            // Arrange
            var email = "valid@example.com";
            var account = new Account { Id = 1, Email = email, Password = "Abc1234.", Name = "Test", Nif = "270251260", State = AccountState.Active };
            _mockContext.Account.Add(account);
            await _mockContext.SaveChangesAsync();

            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            // Act
            var result = await controller.ForgotPassword(email);

            // Assert
            _mockEmailService.Verify(e => e.SendEmail(
                email,
                "Carbon Vault - Recuperar Palavra-Passe",
                It.Is<string>(body => body.Contains("recover-password")), null), Times.Once);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Password recovery link sent successfully", okResult.Value as string);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted(); // Apaga a BD InMemory após os testes
            _mockContext.Dispose();
        }
    }
}
