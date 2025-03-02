using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPaymentsController : ControllerBase
    {

        public UserPaymentsController()
        {
        }

        [HttpPost]
        public IActionResult MakePayment(PaymentInfo payment)
        {
            var success_url = "http://localhost:59115/";
            var cancel_url = "https://localhost:7117/";

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string>
                {
                    "card"
                },
                LineItems = new List<SessionLineItemOptions>
                {
                    AddItem(payment, "Demo Product", "Demo product description", 1),
                    AddItem(payment, "My Product", "My product description", 3),
                },
                Mode = "payment",
                SuccessUrl = success_url,
                CancelUrl = cancel_url
            };

            var service = new SessionService();
            var session = service.Create(options);

            //Response.Headers.Append("Location", session.Url);

            Console.WriteLine("My session: " + session.Url);

            //return Redirect(session.Url);
            return Ok(new { message = "Dados recebidos com sucesso" });
        }

        private SessionLineItemOptions AddItem(PaymentInfo payment, string product_name, string product_description, int quantity)
        {
            return new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = payment.Currency,
                    UnitAmount = Convert.ToInt32(payment.Amount) * 100,
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = product_name,
                        Description = product_description,
                    }
                },
                Quantity = quantity,
            };
        }
    }

    public class PaymentInfo
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; }
    }
}
