using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Carbon_Vault_Tests
{
    public class ForgotPasswordTests
    {
        private readonly Mock<DbSet<Account>> _mockDbSet;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Carbon_VaultContext _mockContext; // Agora instanciamos corretamente

        public ForgotPasswordTests()
        {
            _mockDbSet = new Mock<DbSet<Account>>();
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();

            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");

            // Criar um contexto de base de dados "em memória" para simular um DbContext real
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=Carbon_VaultContext-f8e3ebf7-bbcf-4011-9591-c6829cd05bef;Trusted_Connection=True;MultipleActiveResultSets=true")
                .Options;
            
            _mockContext = new Carbon_VaultContext(options);
        }

        [Fact]
        public async Task ForgotPassword_AccountNotFound_ReturnsNotFound()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            // Act
            var result = await controller.ForgotPassword("rodrigo.s.santos003@gmail.com");

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Account not found.", notFoundResult.Value as string);
        }


        [Fact]
        public async Task ForgotPassword_ValidAccount_SendsEmailAndReturnsOk()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            var email = "rodrigo.s.santos003@gmail.com";

            // Act
            var result = await controller.ForgotPassword(email);

            // Assert
            _mockEmailService.Verify(e => e.SendEmail(
                email,
                "Carbon Vault - Recuperar Palavra-Passe",
                It.Is<string>(body => body.Contains("recover-password"))), Times.Once);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Password recovery link sent successfully", okResult.Value as string);
        }
    }
}
