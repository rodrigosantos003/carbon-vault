CREATE TABLE [dbo].[Account] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Name]      NVARCHAR (100) NOT NULL,
    [Email]     NVARCHAR (MAX) NOT NULL,
    [Password]  NVARCHAR (MAX) NOT NULL,
    [Nif]       NVARCHAR (9)   NOT NULL,
    [State]     INT            NOT NULL,
    [Role]      INT            NOT NULL,
    [CreatedAt] DATETIME2 (7)  NOT NULL,
    [LastLogin] DATETIME2 (7)  NOT NULL,
    [Iban]      NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_Account] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Projects] (
    [Id]                     INT             IDENTITY (1, 1) NOT NULL,
    [Name]                   NVARCHAR (MAX)  NOT NULL,
    [Description]            NVARCHAR (MAX)  NOT NULL,
    [Location]               NVARCHAR (MAX)  NOT NULL,
    [CarbonCreditsGenerated] FLOAT (53)      NOT NULL,
    [StartDate]              DATETIME2 (7)   NOT NULL,
    [EndDate]                DATETIME2 (7)   NOT NULL,
    [Developer]              NVARCHAR (MAX)  NOT NULL,
    [Certification]          NVARCHAR (MAX)  NOT NULL,
    [PricePerCredit]         DECIMAL (18, 2) NULL,
    [CreditsForSale]         INT             NOT NULL,
    [Status]                 INT             NOT NULL,
    [ProjectUrl]             NVARCHAR (MAX)  NULL,
    [ImageUrl]               NVARCHAR (MAX)  NULL,
    [benefits]               NVARCHAR (MAX)  NOT NULL,
    [CreatedAt]              DATETIME2 (7)   NOT NULL,
    [OwnerId]                INT             NOT NULL,
    [IsForSale]              BIT             NOT NULL,
    CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Projects_Account_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[Account] ([Id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_Projects_OwnerId]
    ON [dbo].[Projects]([OwnerId] ASC);

CREATE TABLE [dbo].[ProjectTypes] (
    [Id]   INT IDENTITY (1, 1) NOT NULL,
    [Type] INT NOT NULL,
    CONSTRAINT [PK_ProjectTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
);


CREATE TABLE [dbo].[ProjectProjectType] (
    [ProjectsId] INT NOT NULL,
    [TypesId]    INT NOT NULL,
    CONSTRAINT [PK_ProjectProjectType] PRIMARY KEY CLUSTERED ([ProjectsId] ASC, [TypesId] ASC),
    CONSTRAINT [FK_ProjectProjectType_ProjectTypes_TypesId] FOREIGN KEY ([TypesId]) REFERENCES [dbo].[ProjectTypes] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProjectProjectType_Projects_ProjectsId] FOREIGN KEY ([ProjectsId]) REFERENCES [dbo].[Projects] ([Id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_ProjectProjectType_TypesId]
    ON [dbo].[ProjectProjectType]([TypesId] ASC);


CREATE TABLE [dbo].[ProjectFiles] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [FileName]   NVARCHAR (MAX) NOT NULL,
    [FilePath]   NVARCHAR (MAX) NOT NULL,
    [FileType]   NVARCHAR (MAX) NOT NULL,
    [UploadedAt] DATETIME2 (7)  NOT NULL,
    [ProjectId]  INT            NOT NULL,
    CONSTRAINT [PK_ProjectFiles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProjectFiles_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_ProjectFiles_ProjectId]
    ON [dbo].[ProjectFiles]([ProjectId] ASC);


CREATE TABLE [dbo].[CarbonCredits] (
    [Id]            INT             IDENTITY (1, 1) NOT NULL,
    [ProjectId]     INT             NOT NULL,
    [IssueDate]     DATETIME2 (7)   NOT NULL,
    [ExpiryDate]    DATETIME2 (7)   NOT NULL,
    [SerialNumber]  NVARCHAR (MAX)  NOT NULL,
    [Certification] NVARCHAR (MAX)  NOT NULL,
    [Price]         DECIMAL (18, 2) NOT NULL,
    [IsSold]        BIT             NOT NULL,
    [BuyerId]       INT             NULL,
    [Status]        INT             NOT NULL,
    CONSTRAINT [PK_CarbonCredits] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_CarbonCredits_Account_BuyerId] FOREIGN KEY ([BuyerId]) REFERENCES [dbo].[Account] ([Id]),
    CONSTRAINT [FK_CarbonCredits_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_CarbonCredits_BuyerId]
    ON [dbo].[CarbonCredits]([BuyerId] ASC);


CREATE NONCLUSTERED INDEX [IX_CarbonCredits_ProjectId]
    ON [dbo].[CarbonCredits]([ProjectId] ASC);


CREATE TABLE [dbo].[Reports] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [UserID]          INT            NOT NULL,
    [LastUpdate]      DATETIME2 (7)  NOT NULL,
    [ReportState]     INT            NOT NULL,
    [Text]            NVARCHAR (MAX) NULL,
    [CheckoutSession] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Reports] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Reports_Account_UserID] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Account] ([Id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_Reports_UserID]
    ON [dbo].[Reports]([UserID] ASC);


CREATE TABLE [dbo].[ReportFiles] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [FileName]   NVARCHAR (MAX) NOT NULL,
    [FilePath]   NVARCHAR (MAX) NOT NULL,
    [FileType]   NVARCHAR (MAX) NOT NULL,
    [UploadedAt] DATETIME2 (7)  NOT NULL,
    [ReportId]   INT            NOT NULL,
    CONSTRAINT [PK_ReportFiles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ReportFiles_Reports_ReportId] FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports] ([Id]) ON DELETE CASCADE
);


CREATE NONCLUSTERED INDEX [IX_ReportFiles_ReportId]
    ON [dbo].[ReportFiles]([ReportId] ASC);


CREATE TABLE [dbo].[Tickets] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Title]       NVARCHAR (MAX) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    [Category]    INT            NOT NULL,
    [Priority]    INT            NOT NULL,
    [State]       INT            NOT NULL,
    [CreatedAt]   DATETIME2 (7)  NOT NULL,
    [ReopenAt]    DATETIME2 (7)  NULL,
    [AuthorId]    INT            NOT NULL,
    [Reference]   NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_Tickets] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Tickets_Account_AuthorId] FOREIGN KEY ([AuthorId]) REFERENCES [dbo].[Account] ([Id]) ON DELETE CASCADE
);


CREATE NONCLUSTERED INDEX [IX_Tickets_AuthorId]
    ON [dbo].[Tickets]([AuthorId] ASC);


CREATE TABLE [dbo].[TicketMessages] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [TicketId] INT            NOT NULL,
    [Content]  NVARCHAR (MAX) NOT NULL,
    [AutorId]  INT            NOT NULL,
    [SendDate] DATETIME2 (7)  NOT NULL,
    CONSTRAINT [PK_TicketMessages] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TicketMessages_Account_AutorId] FOREIGN KEY ([AutorId]) REFERENCES [dbo].[Account] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_TicketMessages_Tickets_TicketId] FOREIGN KEY ([TicketId]) REFERENCES [dbo].[Tickets] ([Id])
);

CREATE NONCLUSTERED INDEX [IX_TicketMessages_AutorId]
    ON [dbo].[TicketMessages]([AutorId] ASC);


CREATE NONCLUSTERED INDEX [IX_TicketMessages_TicketId]
    ON [dbo].[TicketMessages]([TicketId] ASC);


CREATE TABLE [dbo].[Transactions] (
    [Id]                 INT            IDENTITY (1, 1) NOT NULL,
    [BuyerId]            INT            NOT NULL,
    [SellerId]           INT            NOT NULL,
    [ProjectId]          INT            NOT NULL,
    [BuyerName]          NVARCHAR (MAX) NOT NULL,
    [SellerName]         NVARCHAR (MAX) NOT NULL,
    [ProjectName]        NVARCHAR (MAX) NOT NULL,
    [ProjectDescription] NVARCHAR (MAX) NOT NULL,
    [ProjectCertifier]   NVARCHAR (MAX) NOT NULL,
    [ProjectLocation]    NVARCHAR (MAX) NOT NULL,
    [Quantity]           INT            NOT NULL,
    [TotalPrice]         FLOAT (53)     NOT NULL,
    [Date]               NVARCHAR (MAX) NOT NULL,
    [State]              INT            NOT NULL,
    [CheckoutSession]    NVARCHAR (MAX) NOT NULL,
    [PaymentMethod]      NVARCHAR (MAX) NOT NULL,
    [isClaimed]			 BIT,
    CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[UserEmissions] (
    [Id]          INT        IDENTITY (1, 1) NOT NULL,
    [electricity] FLOAT (53) NOT NULL,
    [diesel]      FLOAT (53) NOT NULL,
    [petrol]      FLOAT (53) NOT NULL,
    [UserId]      INT        NOT NULL,
    CONSTRAINT [PK_UserEmissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);



