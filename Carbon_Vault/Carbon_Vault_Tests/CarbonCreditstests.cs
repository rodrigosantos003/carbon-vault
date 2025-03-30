using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Carbon_Vault_Tests_CarbonCredits
{
    public class CarbonCreditstests: IDisposable
    {
        private readonly Carbon_VaultContext _context;
        private readonly CarbonCreditsController _controller;

        public CarbonCreditstests()
        {
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

            _context = new Carbon_VaultContext(options);

            _controller = new CarbonCreditsController(_context);
        }

        [Fact]
        public async Task PostCarbonCredit_Success_ReturnsCreatedAtAction()
        {
            // Arrange
            var carbonCredit = new CarbonCredit {
                ProjectId = 1,
                Price = 10,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };

            int userId = 123;
            string userToken = AuthHelper.GerarToken(userId);
            string validToken = "Bearer " + userToken;

            // Act
            var result = await _controller.PostCarbonCredit(carbonCredit, userId, validToken);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("GetCarbonCredit", createdResult.ActionName);
            Assert.Equal(carbonCredit, createdResult.Value);
        }

        [Fact]
        public async Task PostCarbonCredit_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            var carbonCredit = new CarbonCredit {
                ProjectId = 1,
                Price = 10,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };

            string token = "invalid_token";
            int userId = 123;

            // Act
            var result = await _controller.PostCarbonCredit(carbonCredit, userId, token);

            // Assert
            Assert.IsType<UnauthorizedResult>(result.Result);
        }

        [Fact]
        public async Task GetCarbonCredit_Success_ReturnsCarbonCredit()
        {
            // Arrange
            var carbonCredit = new CarbonCredit
            {
                ProjectId = 1,
                Price = 10,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };

            int userId = 123;
            string userToken = AuthHelper.GerarToken(userId);
            string validToken = "Bearer " + userToken;

            await _controller.PostCarbonCredit(carbonCredit, userId, validToken);

            // Act
            var result = await _controller.GetCarbonCredit(carbonCredit.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<CarbonCredit>>(result);
            var returnValue = Assert.IsType<CarbonCredit>(actionResult.Value);
            Assert.Equal(carbonCredit.Id, returnValue.Id);
        }

        [Fact]
        public async Task GetCarbonCredit_NotFound_ReturnsNotFound()
        {
            // Arrange
            int creditId = 1;

            // Act
            var result = await _controller.GetCarbonCredit(creditId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PutCarbonCredit_Success_ReturnsNoContent()
        {
            // Arrange
            var carbonCredit = new CarbonCredit {
                ProjectId = 10,
                Price = 100,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };

            int userId = 123;
            string userToken = AuthHelper.GerarToken(userId);
            string validToken = "Bearer " + userToken;

            await _controller.PostCarbonCredit(carbonCredit, userId, validToken);

            carbonCredit.Price = 500;

            // Act
            var result = await _controller.PutCarbonCredit(carbonCredit.Id, carbonCredit, userId, validToken);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteCarbonCredit_Success_ReturnsNoContent()
        {
            // Arrange
            var carbonCredit = new CarbonCredit
            {
                ProjectId = 1,
                Price = 10,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };

            int userId = 123;
            string userToken = AuthHelper.GerarToken(userId);
            string validToken = "Bearer " + userToken;

            await _controller.PostCarbonCredit(carbonCredit, userId, validToken);

            // Act
            var result = await _controller.DeleteCarbonCredit(carbonCredit.Id, userId, validToken);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteCarbonCredit_ReturnsNotFound()
        {
            // Arrange
            int creditId = 1;
            int userId = 321;
            string userToken = AuthHelper.GerarToken(userId);
            string validToken = "Bearer " + userToken;

            // Act
            var result = await _controller.DeleteCarbonCredit(creditId, userId, validToken);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteCarbonCredit_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            int creditId = 1;
            int userId = 321;
            string userToken = AuthHelper.GerarToken(userId);

            // Act
            var result = await _controller.DeleteCarbonCredit(creditId, userId, userToken);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
