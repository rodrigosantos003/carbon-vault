using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Carbon_Vault_Tests_Auth
{
    public class RegisterAccountsControllerTests
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Carbon_VaultContext _mockContext;
        private readonly Mock<AuthHelper> _mockAuthHelper;

        public RegisterAccountsControllerTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockAuthHelper = new Mock<AuthHelper>();
            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            // Criar um contexto de base de dados InMemory
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
        public async Task CreateNewAccountSuccessfulTest()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            Account demo_acount = new Account { Name = "Demo User", Email = "test@example.com", Password = "Account@123", Nif = "123456789" };

            // Act
            var result = await controller.PostAccount(demo_acount);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedAccount = Assert.IsType<Account>(createdAtActionResult.Value);

            Assert.Equal(201, createdAtActionResult.StatusCode);
            Assert.Equal(AccountState.Pending, returnedAccount.State);
            Assert.NotEqual("Account@123", returnedAccount.Password);
        }

        [Fact]
        public async Task GetTotalAccountsTest()
        {
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);

            var result = await controller.GetAccountsTest();

            var actionResult = Assert.IsType<ActionResult<IEnumerable<Account>>>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<Account>>(actionResult.Value);

            Assert.Equal(3, returnValue.Count());
        }

        [Fact]
        public async Task Login_Successful_ReturnsOk()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            var loginInput = new LoginModel { Email = "user1@example.com", Password = "User@123" };

            // Act
            var result = await controller.Login(loginInput);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;

            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task Login_InvalidEmailOrPassword_ReturnsUnauthorized()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            var loginInput = new LoginModel { Email = "active@example.com", Password = "WrongPassword" };

            // Act
            var result = await controller.Login(loginInput);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var response = unauthorizedResult.Value as dynamic;

            Assert.Equal(401, unauthorizedResult.StatusCode);
        }

        [Fact]
        public async Task ConfirmAccount_Successful_ReturnsOk()
        {
            // Arrange
            var controller = new AccountsController(_mockContext, _mockConfiguration.Object, _mockEmailService.Object);
            int account_id = 3;
            string token = AuthHelper.GerarToken(account_id);

            // Act
            var result = await controller.ConfirmAccount(token);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            Assert.Equal(200, okResult.StatusCode);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted();
            _mockContext.Dispose();
        }
    }
}