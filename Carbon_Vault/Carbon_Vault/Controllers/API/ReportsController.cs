using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;

        public ReportsController(Carbon_VaultContext context, IWebHostEnvironment environment, IEmailService emailService)
        {
            _context = context;
            _environment = environment;
            _emailService = emailService;
        }

        private bool ReportExists(int id)
        {
            return _context.Reports.Any(r => r.Id == id);
        }

        [HttpGet]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Report>>> GetReports()
        {
            return await _context.Reports.ToListAsync();
        }

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

        [HttpGet("{id}/files")]
        public async Task<IActionResult> GetReportFiles(int id)
        {
            var files = await _context.ReportFiles.Where(f => f.ReportId == id).ToListAsync();

            return Ok(files);
        }
    }
}
