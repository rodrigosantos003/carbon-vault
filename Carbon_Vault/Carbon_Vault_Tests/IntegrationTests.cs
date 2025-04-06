using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;


namespace Carbon_Vault_Tests
{
    public class IntegrationTests
    {
        private readonly HttpClient _httpClient;
        private const string ApiKey = "e867f83dedbf7bac7e8e0bb616afc6ca";
        private const string BaseUrl = "http://www.nif.pt/?json=1&q=";

        public IntegrationTests()
        {
            _httpClient = new HttpClient();
        }

        [Fact]
        public async Task ValidateNif_ShouldReturnSuccess()
        {
            // Arrange
            string validNif = "509442013";//Nif válido de Exemplo da API
            var requestUrl = $"{BaseUrl}{validNif}&key={ApiKey}";

            // Act
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content);

            // Assert
            Assert.NotNull(jsonResponse);
            Assert.Equal("success", jsonResponse.GetProperty("result").GetString());
            Assert.True(jsonResponse.GetProperty("nif_validation").GetBoolean());
            Assert.True(jsonResponse.GetProperty("is_nif").GetBoolean());
        }
        [Fact]
        public async Task ValidateNif_MissingApiKey_ShouldReturnKeyNecessaryMessage()
        {
            // Arrange
            string validNif = "123456789";
            var requestUrl = $"{BaseUrl}{validNif}"; // Sem key

            // Act
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content);

            // Assert
            Assert.NotNull(jsonResponse);
            Assert.Equal("success", jsonResponse.GetProperty("result").GetString());
            Assert.Equal("Key necessary. Contact www.nif.pt/contactos/api/", jsonResponse.GetProperty("message").GetString());
            Assert.False(jsonResponse.GetProperty("nif_validation").GetBoolean());
            Assert.True(jsonResponse.GetProperty("is_nif").GetBoolean());
        }
        [Fact]
        public async Task ValidateNif_InvalidNif_ShouldReturnFailure()
        {
            // Arrange
            string invalidNif = "123456789";
            var requestUrl = $"{BaseUrl}{invalidNif}&key={ApiKey}";

            // Act
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content);

            
            // Assert
            Assert.NotNull(jsonResponse);
            Assert.Equal("error", jsonResponse.GetProperty("result").GetString());
            Assert.False(jsonResponse.GetProperty("nif_validation").GetBoolean());
            Assert.True(jsonResponse.GetProperty("is_nif").GetBoolean());
        }

        [Fact]
        public async Task ValidateNif_LimitReached_ShouldReturnError()
        {
            // Arrange
            string validNif = "123456789";
            var requestUrl = $"{BaseUrl}{validNif}&key={ApiKey}";

            // Act
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content);

            // Assert
            Assert.NotNull(jsonResponse);
            Assert.Equal("error", jsonResponse.GetProperty("result").GetString());
            Assert.Equal("Limit per minute reached. Please, try again later or buy credits.", jsonResponse.GetProperty("message").GetString());
            Assert.False(jsonResponse.GetProperty("nif_validation").GetBoolean());
        }

        [Fact]
        public async Task ValidateNif_EmptyNif_ShouldReturnError()
        {
            // Arrange
            string emptyNif = "";
            var requestUrl = $"{BaseUrl}{emptyNif}&key={ApiKey}";

            // Act
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(content);

            // Assert
            Assert.NotNull(jsonResponse);
            Assert.Equal("error", jsonResponse.GetProperty("result").GetString());
        }

    }
}
