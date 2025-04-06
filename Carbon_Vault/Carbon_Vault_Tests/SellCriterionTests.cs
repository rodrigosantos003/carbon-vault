using Xunit;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Linq;
using System.Threading.Tasks;
using Carbon_Vault.Controllers.API;
using Carbon_Vault.Models;
using Carbon_Vault.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Carbon_Vault.Services;

namespace Carbon_Vault_Tests_Projects_Credits
{
    public class SellCriterionTests
    {
        private readonly Carbon_VaultContext _context;
        private readonly ProjectsController _controller;

        public SellCriterionTests()
        {
            var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new Carbon_VaultContext(options);

            var mockEmailService = new Mock<IEmailService>();
            var mockEnvironment = new Mock<IWebHostEnvironment>();

            _controller = new ProjectsController(_context, mockEnvironment.Object, mockEmailService.Object);
        }

        [Fact]
        public async Task UpdateCreditsInfo_ShouldReturnNotFound_WhenProjectDoesNotExist()
        {
            var newInfo = new ProjectsController.UpdateCreditsInfoDto
            {
                PricePerCredit = 10,
                CreditsForSale = 5
            };

            var result = await _controller.UpdateCreditsInfo(999, newInfo); // ID de projeto inexistente

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateCreditsInfo_ShouldReturnBadRequest_WhenPricePerCreditIsInvalid()
        {
            var project = new Project
            {
                Id = 1,
                PricePerCredit = 5,
                CreditsForSale = 10,
                Certification = "Certification",
                Description = "Description",
                Developer = "Developer",
                Location = "Location",
                Name = "Project Name",
                benefits = "Benefits"
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var newInfo = new ProjectsController.UpdateCreditsInfoDto
            {
                PricePerCredit = -1, // Preço inválido
                CreditsForSale = 5
            };

            var result = await _controller.UpdateCreditsInfo(1, newInfo);

            Assert.IsType<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.Equal("Price per credit must be greater than 0.", badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateCreditsInfo_ShouldReturnBadRequest_WhenNotEnoughCreditsForSale()
        {
            var project = new Project
            {
                Id = 1,
                PricePerCredit = 10,
                CreditsForSale = 10,
                Certification = "Certification",
                Description = "Description",
                Developer = "Developer",
                Location = "Location",
                Name = "Project Name",
                benefits = "Benefits"
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var carbonCredits = new CarbonCredit
            {
                ProjectId = 1,
                Price = 10,
                IsSold = false,
                Certification = "Certification",
                SerialNumber = "1234567890"
            };
            _context.CarbonCredits.Add(carbonCredits);
            await _context.SaveChangesAsync();

            var newInfo = new ProjectsController.UpdateCreditsInfoDto
            {
                PricePerCredit = 10,
                CreditsForSale = 5 // Mais créditos para venda do que o disponível
            };

            var result = await _controller.UpdateCreditsInfo(1, newInfo);

            Assert.IsType<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.Equal("Not enough credits to list for sale.", badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateCreditsInfo_ShouldReturnOk_WhenValid()
        {
            var project = new Project
            {
                Id = 1,
                PricePerCredit = 5,
                CreditsForSale = 10,
                Certification = "Certification",
                Description = "Description",
                Developer = "Developer",
                Location = "Location",
                Name = "Project Name",
                benefits = "Benefits"
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Adiciona créditos suficientes não vendidos para o projeto
            for (int i = 0; i < 10; i++)
            {
                _context.CarbonCredits.Add(new CarbonCredit
                {
                    ProjectId = project.Id,
                    Price = 5,
                    IsSold = false,
                    Certification = "Certification",
                    SerialNumber = "1234567890"
                });
            }
            await _context.SaveChangesAsync();

            var newInfo = new ProjectsController.UpdateCreditsInfoDto
            {
                PricePerCredit = 10,
                CreditsForSale = 5 // Dados válidos
            };

            var result = await _controller.UpdateCreditsInfo(1, newInfo);

            Assert.IsType<OkObjectResult>(result);

            var updatedCredits = _context.CarbonCredits.Where(c => c.ProjectId == 1).ToList();
            Assert.All(updatedCredits, c => Assert.Equal(10, c.Price));
        }
    }
}