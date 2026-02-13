# Wolf of Washington - Application Analysis & Technical Specification

## 1. System Context & Architecture

### High-Level Domain Model
The following diagram illustrates the core relationships within the Wolf of Washington ecosystem.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +SubscriptionStatus status
    }
    class Politician {
        +UUID id
        +String name
        +Party party
        +State state
        +List<Trade> trades
    }
    class Trade {
        +UUID id
        +Date executeDate
        +String ticker
        +TransactionType type
        +Amount range
    }
    class Alert {
        +UUID id
        +Trade tradeReference
        +ImpactScore impact
        +Timestamp sentAt
    }
    class Portfolio {
        +List<Position> activePositions
        +List<Position> closedPositions
        +double totalValue
    }

    User "1" -- "1" Portfolio : owns
    User "1" -- "*" Alert : receives
    Politician "1" -- "*" Trade : executes
    Trade "1" -- "0..1" Alert : triggers
```

## 2. Executive Summary
**Wolf of Washington** is a specialized financial intelligence platform designed to track and capitalize on the stock trading activities of US Congress members ("Insider Trading Alerts"). The application leverages a dark, high-contrast aesthetic to project exclusivity and professional-grade data analytics.

**Core Value Proposition:**
- **Real-time Alerts:** Notifications when politicians trade.
- **Copy-Trading Strategy:** Data-backed strategies showing high win rates (up to 77%) based on politician holding periods.
- **Transparency:** Full database of searchable congress trades.

---

## 3. Data Models (JSON Schemas)
These schemas define the core data structures used throughout the application. AI agents should use these definitions when generating API types or database schemas.

### A. Politician Profile
```json
{
  "id": "pol_12345",
  "name": "Nancy Pelosi",
  "party": "Democrat",
  "state": "CA",
  "chamber": "House",
  "committees": ["Speaker Emeritus"],
  "stats": {
    "totalTrades": 142,
    "winRate": 0.68,
    "favoriteSector": "Technology"
  }
}
```

### B. Trade Transaction
```json
{
  "id": "trd_98765",
  "politicianId": "pol_12345",
  "ticker": "NVDA",
  "companyName": "NVIDIA Corp",
  "type": "Purchase",
  "amount": "$1,000,001 - $5,000,000",
  "transactionDate": "2024-11-22",
  "disclosureDate": "2024-12-20",
  "daysLag": 28
}
```

### C. Alert Signal
```json
{
  "id": "alt_55555",
  "tradeId": "trd_98765",
  "severity": "HIGH",
  "message": "Nancy Pelosi disclosed a massive purchase of NVDA.",
  "timestamp": "2024-12-20T14:30:00Z",
  "category": "Technology"
}
```

---

## 4. User Workflows (Sequence Diagrams)

### Workflow: Signal Execution
How a user interacts with a new trade alert.

```mermaid
sequenceDiagram
    participant User
    participant AlertSystem
    participant ResearchDesk
    participant Portfolio

    AlertSystem->>User: Push Notification: "Pelosi bought NVDA"
    User->>AlertSystem: Click Notification
    AlertSystem->>ResearchDesk: Redirect to Alert Detail
    ResearchDesk->>User: Show Trade Analysis & History
    User->>ResearchDesk: Review "Win Rate" for this Ticker
    User->>Portfolio: Add "NVDA" to Watchlist
    Portfolio-->>User: Confirmation Toaster
```

### Workflow: Researching a Politician
How a user investigates a specific figure.

```mermaid
sequenceDiagram
    participant User
    participant DataExplorer
    participant PoliticianProfile
    participant TradeDatabase

    User->>DataExplorer: Select "Politicians" Directory
    DataExplorer->>User: Display Grid (Infinite Scroll)
    User->>DataExplorer: Search for "Ro Khanna"
    DataExplorer->>PoliticianProfile: Navigate to Profile
    PoliticianProfile->>TradeDatabase: Fetch recent trades
    TradeDatabase-->>PoliticianProfile: Return Trade List
    PoliticianProfile->>User: Show Stats & Trade History
```

---

## 5. Component Reference & UI Breakdown

### Global Design System
- **Theme:** Premium Dark Mode (`#000000` / `#121212` backgrounds).
- **Accent:** Gold/Yellow (`#FFD700`).
- **Typography:** Sans-Serif (Inter/Roboto).

### A. Public-Facing & Onboarding

#### Component: `LandingPage`
- **Purpose:** Gateway for specialized access.
- **Key Elements:** "Wolf" Branding, Login/Signup CTAs.
- **Visual:**
![Landing Page](./assets/landing_page_1770801906389.png)

#### Component: `AuthCard`
- **Purpose:** Centralized authentication form.
- **Inputs:** Email, Password.
- **Actions:** "Sign In", "Continue with Apple".
- **Visuals:**
![Login Page](./assets/login_page_1770801906731.png)
![Signup Page](./assets/signup_page_1770801922117.png)

### B. Internal Application

#### Layout: `SidebarNavigation`
- **Items:** Dashboard, Research Desk, Strategy, Data Explorer, Community, Portfolio, Alerts, Settings.

#### 1. Component: `DashboardOverview`
- **Purpose:** Command center for user portfolio and market status.
- **Sub-Components:**
    - `PortfolioSummary`: Total Value, Day's P/L.
    - `MarketHeatmap`: **Critical Feature.** Interactive S&P 500 block visualization.
    - `QuickActions`: Shortcuts to key workflows.
- **Visuals:**
![Dashboard Top](./assets/full_dashboard_top_1770803040403.png)
![Dashboard Middle](./assets/full_dashboard_middle_1770803175424.png)
![Dashboard Bottom](./assets/full_dashboard_bottom_1770803321997.png)

#### 2. Component: `ResearchTimeline`
- **Purpose:** Chronological feed of qualitative insights.
- **Structure:** Vertical timeline with nodes for Alerts and Articles.
- **Data Source:** Aggregated Analyst Reports & Trade Alerts.
- **Visuals:**
![Research Desk Top](./assets/full_researchdesk_top_1770803477225.png)
![Research Desk Middle](./assets/full_researchdesk_middle_1770803581289.png)
![Research Desk Bottom](./assets/full_researchdesk_bottom_1770803613996.png)

#### 3. Component: `StrategyDashboard`
- **Purpose:** Data-backed sales pitch for the strategy.
- **Key Metrics:** "Win Rate" (highlighting 6mo+ hold benefit), "Annualized Return".
- **Data Visualization:** Comparative charts (Strategy vs S&P 500).
- **Visuals:**
![Strategy Top](./assets/full_strategy_top_1770803863880.png)
![Strategy Middle](./assets/full_strategy_1000_1770803902526.png)
![Strategy Bottom](./assets/full_strategy_bottom_1770803949474.png)

#### 4. Component: `DataExplorer`
- **Constraint:** Handle large datasets (43k+ rows).
- **Sub-Components:**
    - `TradeTable`: Searchable, filterable, paginated.
    - `PoliticianGrid`: Card-based directory with load-more functionality.
- **Visuals:**
![Trades Top](./assets/full_trades_top_1770804137079.png)
![Trades Bottom](./assets/full_trades_bottom_1770804203700.png)
![Politicians Directory](./assets/full_politicians_bottom_1770804383810.png)

#### 5. Component: `CommunityHub`
- **Purpose:** Social engagement (Locked Feature).
- **Visual:**
![Community Section](./assets/section_community_1770802266195.png)

#### 6. Component: `PortfolioManager`
- **Purpose:** User position tracking.
- **Tabs:** Positions, Analytics, Watchlist.
- **Visual:**
![Portfolio Section](./assets/full_portfolio_main_1770804767504.png)

#### 7. Component: `AlertFeed`
- **Purpose:** Pure signal stream.
- **Structure:** Infinite scroll list of `AlertCard` components.
- **Visuals:**
![Alerts Top](./assets/full_alerts_top_1770804915571.png)
![Alerts Bottom](./assets/full_alerts_bottom_1770804986443.png)

#### 8. Component: `SettingsPanel`
- **Purpose:** User configuration.
- **Sections:** Account, Notifications, Subscription Sync.
- **Visual:**
![Settings Section](./assets/full_settings_top_1770805224025.png)

---

## 6. Recommendations for Client App Development
Based on this analysis, for a similar "Client Inspiration" app, you should prioritize:
1.  **Immersive Dashboards:** Use visual tools like **Heatmaps** to break up text-heavy data.
2.  **Data Transparency:** Make raw data tables (like "Trades") accessible but filterable.
3.  **Premium Aesthetic:** The "Dark & Gold" palette is key to the brand identity.
4.  **Actionable Signals:** Ensure the "Alerts" feature is prominent and easy to digest as a timeline.
5.  **Community:** Even if locked initially, showing the value of a community feature is a strong upsell driver.
