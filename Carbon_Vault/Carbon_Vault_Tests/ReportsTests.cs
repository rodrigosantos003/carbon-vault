using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Carbon_Vault.Controllers.API;
using Microsoft.AspNetCore.Hosting;

namespace Carbon_Vault_Tests_Reports
{
    public class ReportsTests
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IWebHostEnvironment> _mockEnvironment;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Carbon_VaultContext _mockContext;
        private readonly ReportsController _controller;

        public ReportsTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockEnvironment = new Mock<IWebHostEnvironment>();
            //_mockAuthHelper = new Mock<AuthHelper>();

            _mockConfiguration.Setup(c => c["AppSettings:FrontendBaseUrl"]).Returns("http://localhost:59115/");
            _mockConfiguration.Setup(c => c["AppSettings:TokenSecretKey"]).Returns("jEJQ#5Hxuh*#[ra7k98J=cBRLj]n6ZP1w*2S.M-Pwgr1D;ZQ.C*WgN&HnCG");

            Environment.SetEnvironmentVariable("JWT_KEY", "K1o+fi[9&-{F=y+}w:#6%30kCFM<FEo~");

            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockContext = new Carbon_VaultContext(options);

            _controller = new ReportsController(_mockContext, _mockEnvironment.Object, _mockEmailService.Object);
        }

        [Fact]
        public async Task CreateReport_ReturnsCreatedAtAction_WithCorrectData()
        {
            // Arrange: Create a report object with required fields
            var report = new Report
            {
                UserID = 1, // Simulate a valid user ID
                Text = "Test report submission",
                Files = []
            };

            // Act
            var result = await _controller.CreateReport(report);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdReport = Assert.IsType<Report>(actionResult.Value);

            // Ensure properties are correctly set
            Assert.Equal(1, createdReport.UserID);
            Assert.Equal(ReportState.Pending, createdReport.ReportState);
            Assert.Equal("GetReport", actionResult.ActionName);
        }

        [Fact]
        public async Task CreateReport_ReturnsBadRequest_WhenUserIDIsMissing()
        {
            // Arrange: Create a report with a missing UserID (which is required)
            var report = new Report
            {
                Text = "Invalid report - missing user ID"
            };

            // Act
            var result = await _controller.CreateReport(report);

            // Assert
            var actionResult = Assert.IsType<BadRequestResult>(result.Result);
        }

        [Fact]
        public async Task GetReport_ReturnsOk_WithValidReport()
        {
            // Arrange: Add a test report to the in-memory database
            var report = new Report
            {
                Id = 1,
                UserID = 1,
                Text = "Test report"
            };

            _mockContext.Reports.Add(report);
            await _mockContext.SaveChangesAsync();

            // Act
            var result = await _controller.GetReport(1);

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedReport = Assert.IsType<Report>(actionResult.Value);

            Assert.Equal(1, returnedReport.Id);
            Assert.Equal("Test report", returnedReport.Text);
        }

        [Fact]
        public async Task GetReport_ReturnsNotFound_WhenReportDoesNotExist()
        {
            // Act
            var result = await _controller.GetReport(999); // Non-existent report ID

            // Assert
            var actionResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Nenhum relatório encontrado", actionResult.Value);
        }

        [Fact]
        public async Task UpdateReport_ReturnsOk_WhenSuccessful()
        {
            // Arrange: Add a report to the database
            var report = new Report { Id = 1, UserID = 1, Text = "Original Report" };
            _mockContext.Reports.Add(report);
            await _mockContext.SaveChangesAsync();

            // Retrieve the existing report from the database
            var existingReport = await _mockContext.Reports.FindAsync(1);
            existingReport.Text = "Updated Report"; // Modify it

            // Act
            var result = await _controller.UpdateReport(1, existingReport);

            // Assert
            Assert.IsType<OkResult>(result);

            // Verify that the update was saved
            var modifiedReport = await _mockContext.Reports.FindAsync(1);
            Assert.Equal("Updated Report", modifiedReport.Text);
        }
    }
}
