using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Controllers;
using Carbon_Vault.Models;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Carbon_Vault.Controllers.API;
using Carbon_Vault.Data;

public class ViewTransactionsTests
{
    private readonly TransactionsController _controller;
    private readonly Carbon_VaultContext _context;

    public ViewTransactionsTests()
    {
        var options = new DbContextOptionsBuilder<Carbon_VaultContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Usa um GUID para criar uma BD �nica por teste
            .Options;
        _context = new Carbon_VaultContext(options);
        _controller = new TransactionsController(_context);
    }

    [Fact]
    public async Task GetTransactionsByType_ShouldReturnNotFound_WhenNoTransactionsFound()
    {
        var result = await _controller.GetTransactionsByType(0, 1);
        Console.WriteLine(result.Result);
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetTransactionDetails_ShouldReturnTransaction()
    {
        var transaction = new Transaction 
        { 
            Id = 1, 
            BuyerId = 1, 
            SellerId = 2,
            CheckoutSession = "cs_test_123",
            Date = "2021-01-01",
            PaymentMethod = "Credit Card",
        };

        _context.Account.Add(
            new Account 
            { 
                Id = 1, 
                Email = "teste@gmail.com",
                Name = "Teste",
                Nif = "123456789",
                Role = AccountType.Admin,
                Password = AuthHelper.HashPassword("123456")
            }
        );
        
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var result = await _controller.GetTransactionDetails(1, 1);

        Assert.IsType<OkObjectResult>(result.Result);
    }


    [Fact]
    public async Task GetTransactions_ShouldReturnAllTransactions()
    {
        _context.Transactions.Add(
            new Transaction 
            { 
                Id = 1,
                CheckoutSession = "cs_test_123",
                Date = "2021-01-01",
                PaymentMethod = "Credit Card",
            }
        );
        await _context.SaveChangesAsync();

        var result = await _controller.GetTransactions();
        Assert.IsType<List<Transaction>>(result.Value);
    }

    [Fact]
    public async Task GetTransaction_ShouldReturnNotFound_WhenTransactionDoesNotExist()
    {
        var result = await _controller.GetTransaction(999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetTransaction_ShouldReturnTransaction_WhenTransactionExists()
    {
        _context.Transactions.Add(
            new Transaction 
            { 
                Id = 1,
                CheckoutSession = "cs_test_123",
                Date = "2021-01-01",
                PaymentMethod = "Credit Card",
            }
        );
        
        await _context.SaveChangesAsync();

        var result = await _controller.GetTransaction(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
