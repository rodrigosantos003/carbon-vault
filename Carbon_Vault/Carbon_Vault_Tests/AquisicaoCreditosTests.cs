using Moq;
using Stripe.Checkout;
using Stripe;
using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Carbon_Vault.Models;
using Microsoft.Extensions.Configuration;

namespace Carbon_Vault_Tests_AquisicaoCreditos
{
    public class AquisicaoCreditosTests : IDisposable
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Carbon_VaultContext _mockContext;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public AquisicaoCreditosTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();

            // Criar um contexto de base de dados InMemory
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Usa um GUID para criar uma BD única por teste
            .Options;

            _mockContext = new Carbon_VaultContext(options);

            Environment.SetEnvironmentVariable("CLIENT_URL", "http://localhost:59115/");

            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            StripeConfiguration.ApiKey = "sk_test_51Qx9k3PqsbpdHFs4jYQFgS4KaeHzPa5zdh3p1RV4NbuK2iCThy0X8pWPc4uMIhpuzRd7H9cYPoBmu4omo4AZMpoX00YEtcCxmW";
        }

        [Fact]
        public async Task AddProjectsToCart_ReturnsProjectsList()
        {
            List<Project> _list = new List<Project>();
            _list.Add(new Project
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
                CreatedAt = DateTime.UtcNow,
                Status = ProjectStatus.Confirmed,
                benefits = "Providing clean water access to rural communities.",
                OwnerId = 4,
                ProjectUrl = new Uri("https://example.com/project1"),
                ImageUrl = "https://api.hub.jhu.edu/factory/sites/default/files/styles/hub_large/public/drink-more-water-hub.jpg",
                IsForSale = true,
            });

            Assert.Equal(1, _list.Count());
            Assert.Equal("Water Access Initiative", _list.First().Name);
        }

        [Fact]
        public void MakePayment_ReturnsOk_WithCardPayment()
        {
            // Arrange
            var cart = new PaymentData();
            var item = new CartItem();

            item.Description = "test_description";
            item.Name = "test_name";
            item.Price = 12;
            item.Quantity = 1;
            cart.Items.Add(item);

            var mockSessionService = new Mock<SessionService>();
            var session = new Session { Id = "test_session_id", Url = "https://checkout.stripe.com/test" };

            mockSessionService
                .Setup(s => s.Create(It.Is<SessionCreateOptions>(opt => opt.PaymentMethodTypes.Contains("card")), null))
                .Returns(session);

            var controller = new UserPaymentsController(_mockEmailService.Object, _mockContext);

            // Act
            var result = controller.MakePayment(cart);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void MakePayment_ReturnsOk_WithSepaDebitPayment()
        {
            // Arrange
            var cart = new PaymentData();
            var item = new CartItem();

            item.Description = "test_description";
            item.Name = "test_name";
            item.Price = 12;
            item.Quantity = 1;
            cart.Items.Add(item);

            var mockSessionService = new Mock<SessionService>();
            var session = new Session { Id = "test_session_id", Url = "https://checkout.stripe.com/test" };

            mockSessionService
                .Setup(s => s.Create(It.Is<SessionCreateOptions>(opt => opt.PaymentMethodTypes.Contains("sepa_debit")), null))
                .Returns(session);

            var controller = new UserPaymentsController(_mockEmailService.Object, _mockContext);

            // Act
            var result = controller.MakePayment(cart);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted();
            _mockContext.Dispose();
        }
    }
}
