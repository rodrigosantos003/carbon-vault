-- 1. Inserir tipos de projetos
INSERT INTO [dbo].[ProjectTypes] ([Type]) 
VALUES 
(1), (2), (3), (4), (5), (6), (7), (8), (9),
(10), (11), (12), (13), (14), (15), (16), (17);
-- 2. Inserir contas (Accounts)
INSERT INTO [dbo].[Account] 
([Name], [Email], [Password], [Nif], [State], [Role], [CreatedAt], [LastLogin], [Iban]) 
VALUES 
('Admin', 'admin@carbonvault.com', 'zV/DlseKJHjNzdKvQzNm3LxCWNDeFplbEqJe2/FIIZ9vWuDV23KW7T4u5bjmjVlE', '123456789', 1, 1, GETDATE(), GETDATE(), 'PT50000201231234567890154'),
('John Doe', 'user@carbonvault.com', 'TMUlzHDxHJELZBtsNTsA9FX4eC3NEmrbI4QIogB3LiYfN2BtnYTW4FNmXI6CMAT1', '987654321', 1, 0, GETDATE(), GETDATE(), 'PT50000201239876543210987'),
('John Smith', 'support@carbonvault.com', 'tjuV9ouDvaXTlJ/2QbE3s8SoBofibWMGReyL1ks3p7toMnShEtF+mqoImZWNMi7J', '258741963', 1, 3, GETDATE(), GETDATE(), 'PT50000201239876543210989'),
('Harvey Specter', 'user2@carbonvault.com', 'k0CsUfJNPdEOeHRaAKRrTMNywwrb3xZWV2QeJ93fIqujZHnkF9/KQOPhtwwaBqMF', '222222222', 1, 0,GETDATE(), GETDATE(), 'PT50000201239876543210988');

-- 3. Inserir projetos
INSERT INTO [dbo].[Projects]
([Name], [Description], [Location], [CarbonCreditsGenerated], [StartDate], [EndDate], [Developer], [Certification],
 [PricePerCredit], [CreditsForSale], [Status], [ProjectUrl], [ImageUrl], [benefits], [CreatedAt], [OwnerId], [IsForSale])
VALUES
('Reflorestação Norte', 'Projeto de reflorestação em Trás-os-Montes', 'Trás-os-Montes', 1000.5, '2023-01-01', '2024-01-01',
 'GreenDev', 'ISO14064', 10.5, 800, 1, 'https://projetosverde.pt/reflorestacao', 'https://www.metroparks.net/blog/importance-beauty-forests/',
 'Redução de CO2, biodiversidade, empregos locais', GETDATE(), 2, 1),
('Painéis Solares Algarve', 'Instalação de painéis solares em larga escala', 'Faro', 1500, '2022-06-01', '2023-12-31',
 'SolarNow', 'GoldStandard', 12.0, 1000, 1, 'https://projetosverde.pt/solares', 'https://www.publico.pt/2021/08/28/local/noticia/alcoutim-paineis-solares-cobrem-vazio-deixado-pessoas-1975382',
 'Energia limpa, empregos, redução de CO2', GETDATE(), 4, 1);

-- 4. Associar tipos aos projetos
INSERT INTO [dbo].[ProjectProjectType] ([ProjectsId], [TypesId]) VALUES (1, 1), (1, 3), (2, 2);

-- 5. Inserir ficheiros de projeto
INSERT INTO [dbo].[ProjectFiles]
([FileName], [FilePath], [FileType], [UploadedAt], [ProjectId])
VALUES
('relatorio_reflorestacao.pdf', '/files/reports/relatorio_reflorestacao.pdf', 'PDF', GETDATE(), 1),
('estudo_solar.xlsx', '/files/estudos/estudo_solar.xlsx', 'Excel', GETDATE(), 2);

-- 6. Inserir créditos de carbono
INSERT INTO [dbo].[CarbonCredits]
([ProjectId], [IssueDate], [ExpiryDate], [SerialNumber], [Certification], [Price], [IsSold], [BuyerId], [Status])
VALUES
(1, '2023-03-01', '2033-03-01', 'CC-001-2023', 'ISO14064', 10.5, 0, NULL, 1),
(2, '2022-07-01', '2032-07-01', 'CC-002-2022', 'GoldStandard', 12.0, 1, 1, 1);

-- 7. Inserir relatórios
INSERT INTO [dbo].[Reports] ([UserID], [LastUpdate], [ReportState], [Text], [CheckoutSession])
VALUES
(1, GETDATE(), 1, 'Tudo a funcionar conforme planeado.', NULL),
(2, GETDATE(), 2, 'Necessário revisão técnica do sistema.', NULL);

-- 8. Inserir ficheiros de relatório
INSERT INTO [dbo].[ReportFiles]
([FileName], [FilePath], [FileType], [UploadedAt], [ReportId])
VALUES
('relatorio1.pdf', '/files/relatorios/relatorio1.pdf', 'PDF', GETDATE(), 1),
('relatorio2.pdf', '/files/relatorios/relatorio2.pdf', 'PDF', GETDATE(), 2);

-- 9. Inserir tickets
INSERT INTO [dbo].[Tickets]
([Title], [Description], [Category], [Priority], [State], [CreatedAt], [ReopenAt], [AuthorId], [Reference])
VALUES
('Erro na plataforma', 'Erro ao tentar submeter ficheiro.', 1, 2, 1, GETDATE(), NULL, 1, 'REF001'),
('Dúvida sobre certificação', 'Qual a validade do certificado GoldStandard?', 2, 1, 1, GETDATE(), NULL, 2, 'REF002');

-- 10. Inserir mensagens de tickets
INSERT INTO [dbo].[TicketMessages]
([TicketId], [Content], [AutorId], [SendDate])
VALUES
(1, 'Olá, o erro persiste ao tentar carregar PDF.', 1, GETDATE()),
(2, 'Gostaria de mais informações sobre os certificados utilizados.', 2, GETDATE());

-- 11. Inserir transações
INSERT INTO [dbo].[Transactions]
([BuyerId], [SellerId], [ProjectId], [Quantity], [TotalPrice], [Date], [State], [CheckoutSession], [PaymentMethod])
VALUES
(1, 2, 2, 50, 600.00, '2024-12-01', 1, 'session_abc123', 'Cartão de Crédito');

-- 12. Inserir emissões de utilizadores
INSERT INTO [dbo].[UserEmissions]
([electricity], [diesel], [petrol], [UserId])
VALUES
(150.75, 80.0, 60.2, 1),
(120.0, 100.5, 45.3, 2);
