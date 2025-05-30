﻿using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador de pagamentos do utilizador. Faz a gestão dos processos de pagamento via Stripe, incluindo a criação de sessões de pagamento e o gestão de faturas.
    /// </summary>
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

            var sellerAccount = await _context.Account.FindAsync(sellerId);
            var buyerAccount = await _context.Account.FindAsync(userId);

            string payMethod = GetPaymentMethod(paymentMethod);

            Transaction t = new Transaction
            {
                SellerId = sellerId,
                BuyerId = userId,
                ProjectId = projectId,
                SellerName = sellerAccount.Name,
                BuyerName = buyerAccount.Name,
                ProjectName = project.Name,
                ProjectCertifier = project.Certification,
                ProjectDescription = project.Description,
                ProjectLocation = project.Location,
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

        /// <summary>
        /// Realiza o pagamento de um utilizador com base nos dados fornecidos.
        /// </summary>
        /// <param name="data">Dados do pagamento, incluindo os itens no carrinho e o ID do utilizador.</param>
        /// <param name="type">Tipo de pagamento (ex: "purchase", "donation").</param>
        /// <returns>Retorna a URL de pagamento gerada pela Stripe e o ID da sessão de pagamento.</returns>
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

        /// <summary>
        /// Obtém os detalhes de uma sessão de pagamento com base no ID da sessão fornecido.
        /// </summary>
        /// <param name="sessionId">ID da sessão de pagamento da Stripe.</param>
        /// <returns>Retorna os detalhes da sessão de pagamento, incluindo os itens comprados e o método de pagamento.</returns>
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

        /// <summary>
        /// Cria os itens de pagamento a partir dos dados fornecidos pelo utilizador.
        /// </summary>
        /// <param name="data">Dados do pagamento, incluindo os itens no carrinho.</param>
        /// <returns>Lista de itens de pagamento configurados para a Stripe.</returns>
        private List<SessionLineItemOptions> GetLineItems(PaymentData data)
        {
            List<SessionLineItemOptions> my_list = new List<SessionLineItemOptions>();

            foreach (var item in data.Items)
            {
                my_list.Add(AddItem(item.Price, item.Name, item.Description, item.Quantity));
            }

            return my_list;
        }

        /// <summary>
        /// Adiciona um item ao pagamento, configurando os dados necessários para a Stripe.
        /// </summary>
        /// <param name="amount">Preço unitário do item.</param>
        /// <param name="product_name">Nome do produto.</param>
        /// <param name="product_description">Descrição do produto.</param>
        /// <param name="quantity">Quantidade do produto.</param>
        /// <returns>Retorna um item de pagamento configurado.</returns>
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

        /// <summary>
        /// Obtém o PDF da fatura associada a uma sessão de pagamento.
        /// </summary>
        /// <param name="sessionId">ID da sessão de pagamento da Stripe.</param>
        /// <returns>Retorna o arquivo PDF da fatura, se disponível.</returns>
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

        /// <summary>
        /// Envia a fatura gerada pela Stripe para o e-mail do cliente.
        /// </summary>
        /// <param name="sessionId">ID da sessão de pagamento da Stripe.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro dependendo do resultado.</returns>
        [HttpGet("invoice/{sessionId}/send")]
        public IActionResult SendInvoice(string sessionId)
        {
            var sessionService = new SessionService();
            var session = sessionService.Get(sessionId);

            if (session.InvoiceId != null)
            {
                var invoiceService = new InvoiceService();
                var invoice = invoiceService.Get(session.InvoiceId);

                //_emailService.SendEmail(invoice.CustomerEmail,
                //    $"Carbon Vault - Fatura {invoice.Id}",
                //    $"Junto enviamos a fatura {invoice.Id}, referente ao apgamento efetuado no dia {invoice.DueDate}.",
                //    invoice.InvoicePdf);

                string invoiceEmailHtml = $@"
                <!DOCTYPE html>
                <html lang='pt'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Fatura</title>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                        }}
                        .email-container {{
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            overflow: hidden;
                        }}
                        .email-header {{
                            background: #4ea741;
                            color: #ffffff;
                            text-align: center;
                            padding: 20px;
                        }}
                        .email-body {{
                            padding: 20px;
                            color: #333333;
                            line-height: 1.6;
                        }}
                        .email-footer {{
                            background: #f4f4f4;
                            text-align: center;
                            padding: 10px;
                            font-size: 12px;
                            color: #777777;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-container'>
                        <div class='email-header'>
                            <h1>Fatura Disponível</h1>
                        </div>
                        <div class='email-body'>
                            <p>Olá,</p>
                            <p>Junto enviamos a fatura <strong>{invoice.Id}</strong>, referente ao pagamento efetuado no dia <strong>{invoice.DueDate:dd/MM/yyyy}</strong>.</p>
                            <p>A fatura está em anexo neste email.</p>
                            <p>Para qualquer questão, entre em contacto através de support@CarbonVault.pt</p>
                            <p>Atenciosamente,</p>
                            <p>Equipa do Carbon Vault</p>
                        </div>
                        <div class='email-footer'>
                            <p>&copy; 2025 Carbon Vault. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>";

                                _emailService.SendEmail(
                                    invoice.CustomerEmail,
                                    $"Carbon Vault - Fatura {invoice.Id}",
                                    invoiceEmailHtml,
                                    invoice.InvoicePdf
                                );


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