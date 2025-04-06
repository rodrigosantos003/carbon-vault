using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Carbon_Vault.Models;

public class TokenValidationFilter : IActionFilter
{
    /// <summary>
    /// M�todo que � chamado antes da execu��o de uma a��o no controlador.
    /// Valida o token de autoriza��o e o ID do usu�rio presentes nos cabe�alhos da requisi��o.
    /// Se os cabe�alhos estiverem ausentes ou inv�lidos, a requisi��o � negada com um resultado "Unauthorized".
    /// </summary>
    /// <param name="context"></param>
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var authorizationHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        var userIdHeader = context.HttpContext.Request.Headers["userId"].FirstOrDefault();

        if (string.IsNullOrEmpty(authorizationHeader) || string.IsNullOrEmpty(userIdHeader))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        int userId;
        if (!int.TryParse(userIdHeader, out userId) || !AuthHelper.IsTokenValid(authorizationHeader, userId))
        {
            context.Result = new UnauthorizedResult();
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}