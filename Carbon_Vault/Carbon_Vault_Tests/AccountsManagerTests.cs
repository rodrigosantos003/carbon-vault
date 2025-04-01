using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Carbon_Vault_Tests_AccountsManager
{
    public class AccountsManagerTests : IDisposable
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Carbon_VaultContext _mockContext;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public AccountsManagerTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            Environment.SetEnvironmentVariable("JWT_KEY", "K1o+fi[9&-{F=y+}w:#6%30kCFM<FEo~");

            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Usa um GUID para criar uma BD única por teste
            .Options;

            _mockContext = new Carbon_VaultContext(options);

            SeedDatabase();
        }


        private void SeedDatabase()
        {
            string hashed_pass = AuthHelper.HashPassword("User@123");

            _mockContext.Account.AddRange(new List<Account>
            {
                new Account { Id = 1, Name = "User One", Email = "user1@example.com", Password = hashed_pass, Nif = "111111111", State = AccountState.Active, Role = AccountType.User },
                new Account { Id = 2, Name = "User Two", Email = "user2@example.com", Password = hashed_pass, Nif = "222222222", State = AccountState.Active, Role = AccountType.User },
                new Account { Id = 3, Name = "User Three", Email = "user3@example.com", Password = hashed_pass, Nif = "123456789", State = AccountState.Pending, Role = AccountType.User }
            });

            _mockContext.SaveChanges();
        }

        [Fact]
        public async Task GetAccount_ReturnsAccount_WhenAccountExists()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            string hashed_pass = AuthHelper.HashPassword("User@123");
            Account test_acount = new Account { Id = 1, Name = "User One", Email = "user1@example.com", Password = hashed_pass, Nif = "111111111", State = AccountState.Active, Role = AccountType.User };

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await controller.GetAccount(test_acount.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Account>>(result);
            var returnedAccount = Assert.IsType<Account>(actionResult.Value);
            Assert.Equal(test_acount.Id, returnedAccount.Id);
            Assert.Equal(test_acount.Name, returnedAccount.Name);
        }

        [Fact]
        public async Task GetAccount_ReturnsNotFound_WhenAccountDoesNotExist()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            int accountId = 100;

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await controller.GetAccount(accountId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Account>>(result);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }

        [Fact]
        public async Task PutAccount_ReturnsOk_WhenAccountUpdatedSuccessfully()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            Account acc = _mockContext.Account.First();
            acc.Name = "Updated User";
            acc.Email = "updated@example.com";

            string accountToken = AuthHelper.GerarToken(acc.Id);
            string validToken = "Bearer " + accountToken;

            // Act
            var result = await controller.PutAccount(acc.Id, acc, validToken);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task PutAccount_ReturnsUnauthorized_WhenTokenIsInvalid()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            Account acc = _mockContext.Account.First();
            acc.Name = "Updated User";
            acc.Email = "updated@example.com";

            // Using an invalid token (e.g., random string or expired token)
            string invalidToken = AuthHelper.GerarToken(acc.Id);

            // Act
            var result = await controller.PutAccount(acc.Id, acc, invalidToken);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }



        [Fact]
        public async Task DeleteAccount_ReturnsOk_WhenAccountIsDeletedSuccessfully()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            string hashed_pass = AuthHelper.HashPassword("User@123");
            Account test_admin = new Account { Id = 5, Name = "Test Admin", Email = "admin@example.com", Password = hashed_pass, Nif = "111111111", State = AccountState.Active, Role = AccountType.Admin };

            string adminToken = AuthHelper.GerarToken(test_admin.Id);
            string validToken = "Bearer " + adminToken;
            int accountIdToDelete = 1;

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await controller.DeleteAccount(accountIdToDelete);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, actionResult.StatusCode);

            // Verifica se a conta foi realmente removida
            var deletedAccount = await _mockContext.Account.FindAsync(accountIdToDelete);
            Assert.Null(deletedAccount);
        }

        [Fact]
        public async Task DeleteAccount_ReturnsNotFound_WhenAccountDoesNotExist()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            string hashed_pass = AuthHelper.HashPassword("User@123");
            Account test_admin = new Account { Id = 5, Name = "Test Admin", Email = "admin@example.com", Password = hashed_pass, Nif = "111111111", State = AccountState.Active, Role = AccountType.Admin };

            string adminToken = AuthHelper.GerarToken(test_admin.Id);
            string validToken = "Bearer " + adminToken;
            int nonExistentAccountId = 999;

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await controller.DeleteAccount(nonExistentAccountId);

            // Assert
            var actionResult = Assert.IsType<NotFoundResult>(result);
            Assert.Equal(404, actionResult.StatusCode);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted();
            _mockContext.Dispose();
        }
    }
}