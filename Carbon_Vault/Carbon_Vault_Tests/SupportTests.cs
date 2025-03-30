using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Carbon_Vault_Tests
{
    public class SupportTests : IDisposable
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Carbon_VaultContext _mockContext;
        private readonly Mock<AuthHelper> _mockAuthHelper;

        public SupportTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockAuthHelper = new Mock<AuthHelper>();

            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            Environment.SetEnvironmentVariable("JWT_KEY", "K1o+fi[9&-{F=y+}w:#6%30kCFM<FEo~");

            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockContext = new Carbon_VaultContext(options);
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            string hashed_pass = AuthHelper.HashPassword("User@123");

            _mockContext.Account.AddRange(new List<Account>
                        {
                            new Account { Id = 1, Name = "Admin User", Email = "admin@example.com", Role = AccountType.Admin, State = AccountState.Active, Nif = "12345678", Password = hashed_pass },
                            new Account { Id = 2, Name = "Support User", Email = "support@example.com", Role = AccountType.Support, State = AccountState.Active, Nif = "12345678", Password = hashed_pass },
                            new Account { Id = 3, Name = "Regular User", Email = "user@example.com", Role = AccountType.User, State = AccountState.Active, Nif = "12345678", Password = hashed_pass }
                        });

            _mockContext.Tickets.AddRange(new List<Ticket>
                        {
                            new Ticket { Id = 1, Title = "First Ticket", AuthorId = 3, Reference = "REF123", Description = "Description of the first ticket" },
                            new Ticket { Id = 2, Title = "Second Ticket", AuthorId = 2, Reference = "REF124", Description = "Description of the second ticket" }
                        });

            _mockContext.SaveChanges();
        }

        [Fact]
        public async Task GetTotalTicketsTest()
        {
            var controller = new TicketsController(_mockContext, _mockEmailService.Object);

            int userId = 1;
            string validToken = "Bearer " + AuthHelper.GerarToken(userId);

            var result = await controller.GetTicket(validToken, userId);

            var actionResult = Assert.IsType<ActionResult<IEnumerable<Ticket>>>(result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<Ticket>>(actionResult.Value);

            Assert.Equal(2, returnValue.Count());
        }

        [Fact]
        public async Task CreateNewTicketSuccessfulTest()
        {
            var controller = new TicketsController(_mockContext, _mockEmailService.Object);
            var newTicket = new Ticket { Id = 3, Title = "New Ticket", AuthorId = 1, Reference = "REF125", Description = "Test Ticket" };

            var result = await controller.PostTicket(newTicket);

            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedTicket = Assert.IsType<Ticket>(createdAtActionResult.Value);

            Assert.Equal(201, createdAtActionResult.StatusCode);
            Assert.Equal("New Ticket", returnedTicket.Title);
        }

        [Fact]
        public async Task GetTicketByReference_ReturnsTicket_WhenReferenceIsValid()
        {
            var controller = new TicketsController(_mockContext, _mockEmailService.Object);
            string reference = "REF123";

            int userId = 1; // Admin user
            string validToken = "Bearer " + AuthHelper.GerarToken(userId);

            var result = await controller.GetTicketByReference(reference, validToken, userId);

            var actionResult = Assert.IsType<ActionResult<Ticket>>(result);
            var returnedTicket = Assert.IsType<Ticket>(actionResult.Value);

            Assert.Equal(1, returnedTicket.Id);
        }

        [Fact]
        public async Task GetTicketByReference_ReturnsNotFound_WhenReferenceIsInvalid()
        {
            var controller = new TicketsController(_mockContext, _mockEmailService.Object);
            string reference = "INVALID_REF";

            int userId = 1; // Admin user
            string validToken = "Bearer " + AuthHelper.GerarToken(userId);

            var result = await controller.GetTicketByReference(reference, validToken, userId);

            var actionResult = Assert.IsType<ActionResult<Ticket>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }


        [Fact]
        public async Task DeleteTicket_ReturnsNotFound_WhenTicketDoesNotExist()
        {
            var controller = new TicketsController(_mockContext, _mockEmailService.Object);
            int ticketId = 999; // Non-existent ticket ID

            var result = await controller.DeleteTicket(ticketId);

            var actionResult = Assert.IsType<NotFoundResult>(result);
            Assert.Equal(404, actionResult.StatusCode);
        }

        [Fact]
        public async Task SendMessageToTicket_Successful()
        {
            var controller = new TicketMessagesController(_mockContext, _mockEmailService.Object);
            var newMessage = new TicketMessage { Id = 1, TicketId = 1, Content = "This is a test message", AutorId = 1, SendDate = DateTime.Now };

            int userId = 1; // Admin user
            string validToken = "Bearer " + AuthHelper.GerarToken(userId);

            var result = await controller.SendMessage(newMessage, validToken, userId);

            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedMessage = Assert.IsType<TicketMessage>(createdAtActionResult.Value);

            Assert.Equal(201, createdAtActionResult.StatusCode);
            Assert.Equal("This is a test message", returnedMessage.Content);
            Assert.Equal(1, returnedMessage.TicketId);
        }

        public void Dispose()
        {
            _mockContext.Database.EnsureDeleted();
            _mockContext.Dispose();
        }
    }
}
