using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPaymentsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private static string CURRENCY = "EUR";

        public UserPaymentsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public IActionResult MakePayment(PaymentData data)
        {
            var success_url = "http://localhost:59115/";
            var cancel_url = "https://localhost:7117/";

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                {
                    "card"
                },
                LineItems = GetLineItems(data),
                Mode = "payment",
                SuccessUrl = success_url,
                CancelUrl = cancel_url,
                InvoiceCreation = new SessionInvoiceCreationOptions
                {
                    Enabled = true
                }
            };

            var service = new SessionService();
            var session = service.Create(options);

            //Response.Headers.Append("Location", session.Url);

            Console.WriteLine("Session ID: " + session.Id);
            Console.WriteLine("Session URL: " + session.Url);

            //return Redirect(session.Url);
            return Ok("Pagamento realizado com sucesso.");
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

                return Ok("Fatura enviada com sucesso.");
            }

            return NotFound("Fatura não encontrada.");
        }

    }

    public class PaymentData
    {
        public List<CartItem> Items { get; set; } = new();
    }

    public class CartItem
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
    
}
