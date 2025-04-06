namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe ErrorViewModel representa um modelo de erro para mostrar mensagens de erro no sistema.
    /// </summary>
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }

        /// <summary>
        /// Indica se o identificador da requisição deve ser mostrado.
        /// </summary>
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}