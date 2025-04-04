namespace Carbon_Vault.Models
{
    // A classe ErrorViewModel representa um modelo de erro para exibição de mensagens de erro no sistema.
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        // Indica se o identificador da requisição deve ser exibido.
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
