using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Carbon_Vault_Tests
{
    public class UserPaymentsTests
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public UserPaymentsTests()
        {
            _mockEmailService = new Mock<IEmailService>(); 
            _mockConfiguration = new Mock<IConfiguration>();

            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            StripeConfiguration.ApiKey = "sk_test_51Qx9k3PqsbpdHFs4jYQFgS4KaeHzPa5zdh3p1RV4NbuK2iCThy0X8pWPc4uMIhpuzRd7H9cYPoBmu4omo4AZMpoX00YEtcCxmW";
        }

        [Fact]
        public void MakePayment_ReturnsOk()
        {
            // Arrange
            var paymentInfo = new PaymentInfo();
            paymentInfo.Amount = 12;
            paymentInfo.Currency = "EUR";
            var mockSessionService = new Mock<SessionService>();
            var session = new Session { Id = "test_session_id", Url = "https://checkout.stripe.com/test" };

            mockSessionService.Setup(s => s.Create(It.IsAny<SessionCreateOptions>(), null)).Returns(session);

            var controller = new UserPaymentsController(_mockEmailService.Object);

            // Act
            var result = controller.MakePayment(paymentInfo);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Pagamento realizado com sucesso.", okResult.Value);
        }

        [Fact]
        public void SendInvoice_ReturnsOk_WhenInvoiceExists()
        {
            // Arrange
            var controller = new UserPaymentsController(_mockEmailService.Object);
            var mockSessionService = new Mock<SessionService>();
            var mockInvoiceService = new Mock<InvoiceService>();
            var sessionId = "cs_test_b1havRvXtiYrqxSJEwUlRtIfggNZbIkw076WzKcT0VhYEN2nFhzIQt1vM6";
            var session = new Session { Id = sessionId, InvoiceId = "inv_123" };
            var invoice = new Invoice
            {
                Id = "inv_123",
                CustomerEmail = "rodrigo.s.santos003@gmail.com",
                InvoicePdf = "https://invoice.pdf",
                DueDate = DateTime.UtcNow
            };

            mockSessionService.Setup(s => s.Get(sessionId, null, null)).Returns(session);
            mockInvoiceService.Setup(i => i.Get(session.InvoiceId, null, null)).Returns(invoice);

            // Act
            var result = controller.SendInvoice(sessionId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Fatura enviada com sucesso.", okResult.Value);

            // Verifica se o email foi enviado
            _mockEmailService.Verify(e => e.SendEmail(
                invoice.CustomerEmail,
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>()
            ), Times.Once);
        }
    }
}
