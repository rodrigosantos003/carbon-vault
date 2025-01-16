# Carbon Vault

Marketplace de crétidos de carbono

## Índice

1. [Autores](#autores)
2. [Plataformas](#plataformas)
3. [Instruções p/ Desenvolvimento](#instruções-p-desenvolvimento)

## Autores

- André Castanho
- João Fernandes
- Rodrigo Santos
- Rúben Dâmaso

## Plataformas

- [Jira Product Discovery](https://rdamaso.atlassian.net/jira/polaris/projects/CVPD/ideas/view/5904945)
- [Jira Software](https://rdamaso.atlassian.net/jira/software/c/projects/CV/boards/3)
- [Confluence](https://rdamaso.atlassian.net/jira/polaris/projects/CVPD/ideas/view/5904945)

## Instruções p/ Desenvolvimento

### Instalação

1. Visual Studio: Instalar os módulos:
    - ASP.NET e desenvolvimento Web
    - Desenvolvimento para desktop com .NET
2. Node.js: versão 22.12.0
3. Angular: Executar no CMD o comando `npm install -g @angular/cli`

### Base de dados

1. Aceder ao terminal no menu `Tools > NuGet Package Manager > Package Manager Console`
2. Na primeira criação, executar o comando `add-migration initial`
3. Executar o comando `update-database`. Este comando deve ser executado sempre que se atualize os models

### Iniciar o programa

1. Iniciar o projeto Carbon_Vault no IDE
2. Abrir Carbon_Vault.client no CMD e executar o comando `ng serve`


### Ligação front e back
1. No front , navegar até `Carbon_Vault\Carbon_Vault_Angular\carbon_vault_angular.client\src\proxy.conf.js` e substituir o valor do Localhost pelo valor fornecido pelo PC
2. No Back , navegar até `Carbon_Vault\Carbon_Vault\appsettings.json` e substituir o `valor de FrontendBaseUrl` para o valor do Localhost pelo valor fornecido pelo PC

## Endpoints API

[Coleção Postman](./CV.postman_collection.json)
