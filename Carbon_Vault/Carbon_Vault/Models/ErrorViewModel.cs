namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe ErrorViewModel representa um modelo de erro para exibi��o de mensagens de erro no sistema.
    /// </summary>
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        /// <summary>
        /// Indica se o identificador da requisi��o deve ser exibido.
        /// </summary>
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}