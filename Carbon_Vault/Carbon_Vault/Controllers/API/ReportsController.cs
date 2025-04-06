using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador responsável pela gestão de relatórios na API.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;

        /// <summary>
        /// Construtor do controlador de relatórios.
        /// </summary>
        /// <param name="context">Contexto do banco de dados.</param>
        /// <param name="environment">Ambiente do servidor web.</param>
        /// <param name="emailService">Serviço de envio de emails.</param>
        public ReportsController(Carbon_VaultContext context, IWebHostEnvironment environment, IEmailService emailService)
        {
            _context = context;
            _environment = environment;
            _emailService = emailService;
        }

        /// <summary>
        /// Verifica se um relatório existe no banco de dados.
        /// </summary>
        /// <param name="id">O identificador único do relatório.</param>
        /// <returns>Retorna true se o relatório existir, caso contrário, retorna false.</returns>
        private bool ReportExists(int id)
        {
            return _context.Reports.Any(r => r.Id == id);
        }

        /// <summary>
        /// Obtém a lista de todos os relatórios disponíveis no sistema.
        /// </summary>
        /// <returns>Uma lista contendo todos os relatórios.</returns>
        [HttpGet]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Report>>> GetReports()
        {
            return await _context.Reports.ToListAsync();
        }

        /// <summary>
        /// Obtém um relatório específico pelo seu ID.
        /// </summary>
        /// <param name="id">O identificador único do relatório.</param>
        /// <returns>Retorna o relatório correspondente ou erro 404 se não for encontrado.</returns>
        [HttpGet("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<Report>> GetReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);

            if (report == null)
            {
                return NotFound("Nenhum relatório encontrado");
            }

            return Ok(report);
        }

        /// <summary>
        /// Obtém a lista de relatórios pertencentes a um utilizador específico.
        /// </summary>
        /// <param name="userID">O identificador único do utilizador.</param>
        /// <returns>Uma lista de relatórios associados ao utilizador ou erro 404 se nenhum for encontrado.</returns>
        [HttpGet("User/{userID}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Report>>> GetUserReports(int userID)
        {
            try
            {
                var reports = await _context.Reports.Where(r => r.UserID == userID).ToListAsync();

                if (reports == null || reports.Count == 0)
                {
                    return NotFound("Nenhum relatório encontrado para este utilizador.");
                }

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Cria um novo relatório no sistema.
        /// </summary>
        /// <param name="report">Objeto contendo os dados do relatório.</param>
        /// <returns>Retorna o relatório criado com status 201 (Created).</returns>
        [HttpPost]
        public async Task<ActionResult<Report>> CreateReport(Report report)
        {
            if (report.UserID <= 0)
            {
                return BadRequest(); // Return 400 Bad Request if invalid
            }

            report.LastUpdate = DateTime.Now;
            report.ReportState = ReportState.Pending;

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReport", new { id = report.Id }, report);
        }

        /// <summary>
        /// Atualiza um relatório existente.
        /// </summary>
        /// <param name="id">O identificador único do relatório.</param>
        /// <param name="report">Objeto contendo os dados atualizados do relatório.</param>
        /// <returns>Retorna OK se a atualização for bem-sucedida, ou erro se houver falha.</returns>
        [HttpPut("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> UpdateReport(int id, Report report)
        {
            if (id != report.Id)
            {
                return BadRequest();
            }

            report.LastUpdate = DateTime.Now;

            _context.Entry(report).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReportExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        /// <summary>
        /// Faz upload de arquivos associados a um relatório específico.
        /// </summary>
        /// <param name="id">O identificador único do relatório.</param>
        /// <param name="files">Lista de arquivos a serem enviados.</param>
        /// <returns>Retorna a lista de arquivos enviados ou um erro caso não sejam enviados arquivos.</returns>
        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadReportFiles(int id, List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var uploadedFiles = new List<ReportFiles>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var fileName = Guid.NewGuid().ToString() + Path.GetFileName(file.FileName);
                var directoryPath = Path.Combine(_environment.ContentRootPath, "App_Data", "files");

                Directory.CreateDirectory(directoryPath);

                var filePath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var reportFile = new ReportFiles
                {
                    FileName = Guid.NewGuid().ToString() + fileName,
                    FilePath = $"{Request.Scheme}://{Request.Host}/files/{fileName}",
                    FileType = Path.GetExtension(fileName).TrimStart('.'),
                    UploadedAt = DateTime.Now,
                    ReportId = id
                };

                _context.ReportFiles.Add(reportFile);
                uploadedFiles.Add(reportFile);
            }

            await _context.SaveChangesAsync();

            return Ok(uploadedFiles);
        }

        /// <summary>
        /// Obtém os arquivos associados a um relatório específico.
        /// </summary>
        /// <param name="id">O identificador único do relatório.</param>
        /// <returns>Retorna a lista de arquivos do relatório.</returns>
        [HttpGet("{id}/files")]
        public async Task<IActionResult> GetReportFiles(int id)
        {
            var files = await _context.ReportFiles.Where(f => f.ReportId == id).ToListAsync();

            return Ok(files);
        }
    }
}