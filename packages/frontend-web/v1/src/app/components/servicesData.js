import {
  DashboardIcon,
  MarketsIcon,
  TradeIcon,
  PortfolioIcon,
  ApiKeysIcon,
  DocsIcon,
  TerminalIcon,
} from './NavIcons';

export const ALL_SERVICES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    shortDesc: 'Account overview & oracle feeds',
    category: 'Trading & Markets',
    href: '/dashboard',
    icon: DashboardIcon,
    accentColor: '#2563EB',
  },
  {
    id: 'markets',
    name: 'Markets',
    shortDesc: 'Real-time spot prices & depth',
    category: 'Trading & Markets',
    href: '/markets',
    icon: MarketsIcon,
    accentColor: '#059669',
  },
  {
    id: 'trade',
    name: 'Trade Desk',
    shortDesc: 'EIP-712 simulated paper trading',
    category: 'Trading & Markets',
    href: '/trade',
    icon: TradeIcon,
    accentColor: '#D97706',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    shortDesc: 'On-chain balances & holdings',
    category: 'Trading & Markets',
    href: '/portfolio',
    icon: PortfolioIcon,
    accentColor: '#7C3AED',
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    shortDesc: 'REST credentials & rate limits',
    category: 'Developer & APIs',
    href: '/api',
    icon: ApiKeysIcon,
    accentColor: '#DB2777',
  },
  {
    id: 'docs',
    name: 'API Docs',
    shortDesc: 'Endpoints, params & curl examples',
    category: 'Developer & APIs',
    href: '/docs',
    icon: DocsIcon,
    accentColor: '#0284C7',
  },
  {
    id: 'cli-terminal',
    name: 'CLI Terminal',
    shortDesc: 'Embedded command-line shell',
    category: 'Developer & APIs',
    isAction: true,
    actionType: 'TOGGLE_TERMINAL',
    icon: TerminalIcon,
    accentColor: '#0D9488',
  },
];

export const SERVICE_CATEGORIES = ['Trading & Markets', 'Developer & APIs'];

