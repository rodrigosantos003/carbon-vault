using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPaymentsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private static string CURRENCY = "EUR";
        private readonly Carbon_VaultContext _context;

        public UserPaymentsController(IEmailService emailService, Carbon_VaultContext context)
        {
            _emailService = emailService;
            _context = context;
        }

        private async Task AddPurchaseTransactionAsync(int userId, int projectId, int quantity, double total, string paymentMethod, string checkoutSession)
        {
            var project = await _context.Projects.FindAsync(projectId);
            int sellerId = project.OwnerId;

            string payMethod = GetPaymentMethod(paymentMethod);

            Transaction t = new Transaction
            {
                SellerId = sellerId,
                BuyerId = userId,
                ProjectId = projectId,
                Quantity = quantity,
                Date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                State = TransactionState.Approved,
                PaymentMethod = payMethod,
                CheckoutSession = checkoutSession,
                TotalPrice = total,
            };

            _context.Transactions.Add(t);
            await _context.SaveChangesAsync();
        }

        private static string GetPaymentMethod(string paymentMethod)
        {
            if (paymentMethod == "card")
                return "Cartão";

            return "Transferência Bancária";
        }

        [HttpPost]
        public IActionResult MakePayment(PaymentData data, string type)
        {
            var success_url = Environment.GetEnvironmentVariable("CLIENT_URL") + "payment-success/" + type;
            var cancel_url = Environment.GetEnvironmentVariable("CLIENT_URL") + "dashboard";

            var account = _context.Account.FindAsync(data.UserId);

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                {
                    "card",
                    /*
                    Card Success Payment
                    Email: qualquer
                    Card Info: 4242 4242 4242 4242
                    (data superior atual) CVC: 424
                    Cardholder Name: 424242
                    */

                    "sepa_debit"
                    /*
                    SEPA Success Payment
                    Email: qualquer
                    IBAN: DE89370400440532013000
                    Name account: 424242
                    Address: 424242
                    Postal-code: 4242
                    City: 4242
                    */
                },
                LineItems = GetLineItems(data),
                Mode = "payment",
                SuccessUrl = success_url,
                CancelUrl = cancel_url,
                Metadata = new Dictionary<string, string>
                {
                    { "userId", data.UserId.ToString() },
                    { "itemID", data.Items.First().Id.ToString() }
                },
                InvoiceCreation = new SessionInvoiceCreationOptions
                {
                    Enabled = true,
                    InvoiceData = new SessionInvoiceCreationInvoiceDataOptions
                    {
                        Description = "NIF: " + account.Result.Nif
                    }
                }
            };

            var service = new SessionService();
            var session = service.Create(options);

            //Console.WriteLine("Session ID: " + session.Id);
            //Console.WriteLine("Session URL: " + session.Url);

            var lineItems = GetLineItems(data);
            //var firstItem = lineItems.FirstOrDefault();

            return Ok(new { message = "Pagamento realizado com sucesso.", checkout_session = session.Id, payment_url = session.Url });
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSessionDetails(string sessionId)
        {
            try
            {
                var sessionService = new SessionService();
                var session = await sessionService.GetAsync(sessionId);

                var lineItemService = new SessionLineItemService();
                var lineItems = await lineItemService.ListAsync(sessionId);

                var paymentIntentService = new PaymentIntentService();
                var paymentIntent = await paymentIntentService.GetAsync(session.PaymentIntentId);

                // Retrieve metadata safely
                var userId = session.Metadata.ContainsKey("userId") ? session.Metadata["userId"] : "N/A";
                var itemId = session.Metadata.ContainsKey("itemID") ? session.Metadata["itemID"] : "N/A";

                var result = new
                {
                    AmountTotal = (double)(session.AmountTotal / 100.0), // Convert from cents to currency
                    Currency = session.Currency,
                    PaymentMethod = paymentIntent.PaymentMethodTypes.FirstOrDefault(),
                    UserId = int.Parse(userId),
                    FirstItemId = int.Parse(itemId),
                    FirstItemQuantity = Convert.ToInt32(lineItems.Data.FirstOrDefault()?.Quantity ?? 0),
                    Products = lineItems.Data.Select(item => new
                    {
                        Name = item.Description,
                        Quantity = item.Quantity,
                        Price = item.AmountTotal / 100.0,
                    })
                };

                await AddPurchaseTransactionAsync(result.UserId, result.FirstItemId, result.FirstItemQuantity, result.AmountTotal, result.PaymentMethod, sessionId);

                return Ok(result);
            }
            catch (StripeException e)
            {
                return BadRequest(new { error = e.Message });
            }
        }

        private List<SessionLineItemOptions> GetLineItems(PaymentData data)
        {
            List<SessionLineItemOptions> my_list = new List<SessionLineItemOptions>();

            foreach (var item in data.Items)
            {
                my_list.Add(AddItem(item.Price, item.Name, item.Description, item.Quantity));
            }

            return my_list;
        }

        private SessionLineItemOptions AddItem(decimal amount, string product_name, string product_description, int quantity)
        {
            return new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = CURRENCY,
                    UnitAmount = (long?)(amount * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = product_name,
                        Description = product_description,
                    }
                },
                Quantity = quantity,
            };
        }

        [HttpGet("invoice/{sessionId}")]
        public IActionResult GetInvoicePdf(string sessionId)
        {
            var sessionService = new SessionService();
            var session = sessionService.Get(sessionId);

            if (session.InvoiceId != null)
            {
                var invoiceService = new InvoiceService();
                var invoice = invoiceService.Get(session.InvoiceId);

                return Ok(new { message = "Fatura enviada com sucesso.", file = invoice.InvoicePdf });
            }

            return NotFound(new { message = "Fatura não encontrada." });
        }

        [HttpGet("invoice/{sessionId}/send")]
        public IActionResult SendInvoice(string sessionId)
        {
            var sessionService = new SessionService();
            var session = sessionService.Get(sessionId);

            if (session.InvoiceId != null)
            {
                var invoiceService = new InvoiceService();
                var invoice = invoiceService.Get(session.InvoiceId);

                _emailService.SendEmail(invoice.CustomerEmail,
                    $"Carbon Vault - Fatura {invoice.Id}",
                    $"Junto enviamos a fatura {invoice.Id}, referente ao apgamento efetuado no dia {invoice.DueDate}.",
                    invoice.InvoicePdf);

                return Ok(new { message = "Fatura enviada com sucesso." });
            }

            return NotFound(new { message = "Fatura não encontrada." });
        }

    }

    public class PaymentData
    {
        public List<CartItem> Items { get; set; } = new();
        public int UserId { get; set; }
    }

    public class CartItem
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

}