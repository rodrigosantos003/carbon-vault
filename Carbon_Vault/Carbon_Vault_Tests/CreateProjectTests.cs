using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Controllers.API;
using Carbon_Vault.Models;
using Moq;
using Microsoft.AspNetCore.Hosting;
using Carbon_Vault.Services;

public class ProjectControllerTests
{
    private readonly Carbon_VaultContext _context;
    private readonly ProjectsController _controller;

    public ProjectControllerTests()
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
    public async Task PostProject_ShouldReturnBadRequest_WhenOwnerIdIsInvalid()
    {
        var project = new Project { OwnerId = 0 };

        var result = await _controller.PostProject(project);

        Assert.IsType<ActionResult<Project>>(result);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task PostProject_ShouldReturnBadRequest_WhenOwnerDoesNotExist()
    {
        var project = new Project
        {
            OwnerId = 123,
            Name = "Invalid Project",
            Certification = "None",
            Description = "Invalid Description",
            Developer = "Invalid Developer",
            Location = "Invalid Location",
            benefits = "None",
            Types = new List<ProjectType>()
        };

        var result = await _controller.PostProject(project);

        Assert.IsType<ActionResult<Project>>(result);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task PostProject_ShouldReturnBadRequest_WhenProjectTypesAreInvalid()
    {
        var owner = new Account { Id = 123, Email = "owner@example.com", Name = "Owner", Nif = "123456789", Password = "password" };
        await _context.Account.AddAsync(owner);
        await _context.SaveChangesAsync();

        var project = new Project
        {
            OwnerId = 123,
            Name = "Invalid Types Project",
            Certification = "None",
            Description = "Invalid Types",
            Developer = "Invalid Developer",
            Location = "Invalid Location",
            benefits = "None",
            Types = new List<ProjectType> { new ProjectType { Id = 999 } }
        };

        var result = await _controller.PostProject(project);

        Assert.IsType<ActionResult<Project>>(result);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task PostProject_ShouldCreateProject_WhenValid()
    {
        var owner = new Account { Id = 123, Email = "owner@example.com", Name = "Owner", Nif = "123456789", Password = "password" };
        await _context.Account.AddAsync(owner);

        var projectType = new ProjectType { Id = 1 };
        await _context.ProjectTypes.AddAsync(projectType);
        await _context.SaveChangesAsync();

        var project = new Project
        {
            OwnerId = 123,
            Name = "New Project",
            Certification = "Certified",
            Description = "Valid Project Description",
            Developer = "Valid Developer",
            Location = "Valid Location",
            benefits = "Environmental Benefits",
            Types = new List<ProjectType> { projectType }
        };

        var result = await _controller.PostProject(project);

        Assert.IsType<ActionResult<Project>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal("GetProject", createdResult.ActionName);
    }
}
