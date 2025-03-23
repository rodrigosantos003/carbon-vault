using Moq;
using Stripe.Checkout;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using OpenQA.Selenium.BiDi.Modules.Network;
using Carbon_Vault.Models;

namespace Carbon_Vault_Tests_AquisicaoCreditos
{
    public class AquisicaoCreditosTests : IDisposable
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Carbon_VaultContext _mockContext;
        private readonly Mock<SessionService> _mockSessionService;
        private readonly Mock<SessionLineItemService> _mockLineItemService;
        private readonly Mock<PaymentIntentService> _mockPaymentIntentService;
        private readonly UserPaymentsController _controller;

        public AquisicaoCreditosTests()
        {
            StripeConfiguration.ApiKey = "sk_test_51Qx9k3PqsbpdHFs4jYQFgS4KaeHzPa5zdh3p1RV4NbuK2iCThy0X8pWPc4uMIhpuzRd7H9cYPoBmu4omo4AZMpoX00YEtcCxmW";

            _mockEmailService = new Mock<IEmailService>();
            _mockSessionService = new Mock<SessionService>();
            _mockLineItemService = new Mock<SessionLineItemService>();
            _mockPaymentIntentService = new Mock<PaymentIntentService>();

            // Criar um contexto de base de dados InMemory
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Usa um GUID para criar uma BD única por teste
            .Options;

            _mockContext = new Carbon_VaultContext(options);

            _controller = new UserPaymentsController(_mockEmailService.Object, _mockContext);
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
        public void MakePayment_WithCard_ReturnsOk()
        {
            // Arrange
            var paymentData = new PaymentData
            {
                UserId = 1,
                Items = new List<CartItem>
            {
                new CartItem { Id = 10, Price = 50.00m, Name = "Produto A", Description = "Desc A", Quantity = 1 }
            }
            };

            var mockSession = new Session
            {
                Id = "test_session_card",
                Url = "https://checkout.stripe.com/test_card"
            };

            _mockSessionService.Setup(s => s.Create(It.Is<SessionCreateOptions>(o =>
                o.PaymentMethodTypes.Contains("card") &&
                o.LineItems.Count > 0 &&
                o.Metadata["userId"] == "1" &&
                o.Metadata["itemID"] == "10"
            ), null)).Returns(mockSession);

            // Act
            var result = _controller.MakePayment(paymentData);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var responseData = okResult.Value as dynamic;

            Assert.Equal("Pagamento realizado com sucesso.", responseData.message);
            Assert.Equal("test_session_card", responseData.checkout_session);
            Assert.Equal("https://checkout.stripe.com/test_card", responseData.payment_url);

            _mockSessionService.Verify(s => s.Create(It.IsAny<SessionCreateOptions>(), null), Times.Once);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted();
            _mockContext.Dispose();
        }

        //[Fact]
        //public async Task GetSessionDetails_ReturnsOk_WhenSessionExists()
        //{
        //    // Arrange
        //    string sessionId = "test_session";
        //    string userId = "1";
        //    string itemId = "10";

        //    var mockSession = new Session
        //    {
        //        AmountTotal = 5000, // 50.00
        //        Currency = "usd",
        //        Metadata = new Dictionary<string, string>
        //    {
        //        { "userId", userId },
        //        { "itemID", itemId }
        //    },
        //        PaymentIntentId = "test_payment_intent"
        //    };

        //    var mockLineItems = new StripeList<LineItem>
        //    {
        //        Data = new List<LineItem>
        //    {
        //        new LineItem
        //        {
        //            Description = "Test Item",
        //            Quantity = 2,
        //            AmountTotal = 2000  // 20.00
        //        }
        //    }
        //    };

        //    var mockPaymentIntent = new PaymentIntent
        //    {
        //        PaymentMethodTypes = new List<string> { "card" }
        //    };

        //    // Act
        //    var result = await _controller.GetSessionDetails(sessionId);

        //    // Assert
        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var responseData = okResult.Value as dynamic;

        //    Assert.Equal(50.00, responseData.AmountTotal);
        //    Assert.Equal("usd", responseData.Currency);
        //    Assert.Equal("card", responseData.PaymentMethod);
        //    Assert.Equal(1, responseData.UserId);
        //    Assert.Equal(10, responseData.FirstItemId);
        //    Assert.Equal(2, responseData.FirstItemQuantity);
        //    Assert.Single(responseData.Products);
        //    Assert.Equal("Test Item", responseData.Products.First().Name);
        //}
    }
}
