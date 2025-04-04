namespace Carbon_Vault.Models
{
    // A classe ErrorViewModel representa um modelo de erro para exibi��o de mensagens de erro no sistema.
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        // Indica se o identificador da requisi��o deve ser exibido.
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
