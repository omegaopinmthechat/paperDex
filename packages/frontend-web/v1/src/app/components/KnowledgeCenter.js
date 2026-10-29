'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTerminal } from './terminal/TerminalContext';
import {
  KnowledgeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  ShieldIcon,
  ZapIcon,
  GlobeIcon,
  CodeIcon,
  QuestionIcon,
  CheckCircleIcon,
  BookOpenIcon,
  CopyIcon,
  CheckIcon,
  TradeIcon,
  MarketsIcon,
  PortfolioIcon,
  ApiKeysIcon,
  TerminalIcon,
} from './NavIcons';

export default function KnowledgeCenter() {
  const { setIsOpen: setTerminalOpen } = useTerminal();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState('faq-balance-delay');
  const [copiedCode, setCopiedCode] = useState(false);

  const categories = [
    { id: 'all', label: 'All FAQs' },
    { id: 'faq', label: 'Account & 100k Balance' },
    { id: 'guide', label: 'How to Use' },
    { id: 'api', label: 'API & Developer' },
    { id: 'architecture', label: 'Oracle & Security' },
    { id: 'company', label: 'What We Do' },
  ];

  const quickLinks = [
    {
      title: 'REST API Documentation',
      desc: 'Complete endpoint specs, request body schemas, and response types.',
      href: '/docs',
      icon: BookOpenIcon,
      accentColor: '#0284C7',
      badge: 'v2.0 Spec',
    },
    {
      title: 'API Key Management',
      desc: 'Create, inspect, and revoke programmatic authentication tokens.',
      href: '/api',
      icon: ApiKeysIcon,
      accentColor: '#DB2777',
      badge: 'Security',
    },
    {
      title: 'Trade Execution Desk',
      desc: 'Simulated EIP-712 execution terminal with live order routing.',
      href: '/trade',
      icon: TradeIcon,
      accentColor: '#D97706',
      badge: 'Zero Gas',
    },
    {
      title: 'Real-Time Oracle Markets',
      desc: 'Spot rates and liquidity depths for BTCP, ETHP, SOLP, and USDTP.',
      href: '/markets',
      icon: MarketsIcon,
      accentColor: '#059669',
      badge: 'Live Feeds',
    },
    {
      title: 'On-Chain Portfolio',
      desc: 'Monitor simulated asset holdings, net worth, and balance history.',
      href: '/portfolio',
      icon: PortfolioIcon,
      accentColor: '#7C3AED',
      badge: 'Analytics',
    },
    {
      title: 'Developer CLI Sandbox',
      desc: 'Embedded interactive shell for rapid terminal pricing queries.',
      href: '#cli',
      isCli: true,
      icon: TerminalIcon,
      accentColor: '#0D9488',
      badge: 'Ctrl + `',
    },
  ];

  const faqs = [
    {
      id: 'faq-balance-delay',
      category: 'faq',
      categories: ['all', 'faq', 'guide', 'account', 'company'],
      featured: true,
      question: "I have created a new account but it doesn't show 100k dollars in portfolio. What should I do?",
      answer:
        'Please wait for a few minutes (10-15 minutes) and keep refreshing the portfolio page. The 100k will be credited automatically. The initial 100,000 USDTP starter capital is minted and confirmed on-chain on Ethereum Sepolia by our relayer node. As soon as the network block confirmations clear, your 100,000 USDTP balance will appear.',
      tags: ['100k Balance', 'New Account', 'Portfolio', 'Troubleshooting', 'Sepolia'],
    },
    {
      id: 'faq-1',
      category: 'company',
      categories: ['all', 'company'],
      question: 'What is PaperDEX and how does it work?',
      answer:
        'PaperDEX is an institutional-grade simulated decentralized exchange (paper trading DEX) running on Ethereum Sepolia. It allows traders, quantitative developers, and institutions to test execution strategies, bots, and order routing using real-world oracle market prices without risking real monetary capital.',
      tags: ['Overview', 'Paper Trading'],
    },
    {
      id: 'faq-2',
      category: 'architecture',
      categories: ['all', 'architecture'],
      question: 'How does PaperDEX execute trades with zero gas fees?',
      answer:
        'PaperDEX utilizes EIP-712 typed structured data signatures. When you place a buy or sell order, your Web3 wallet signs a cryptographically secure intent off-chain. Our autonomous relayer node absorbs the on-chain gas costs, submitting the batch to Sepolia smart contracts and atomically updating simulated balances.',
      tags: ['EIP-712', 'Gasless', 'Relayer'],
    },
    {
      id: 'faq-3',
      category: 'architecture',
      categories: ['all', 'architecture'],
      question: 'Where do PaperDEX spot prices come from?',
      answer:
        'All market quotations for BTCP, ETHP, SOLP, and synthetic assets are powered by real-time decentralized oracle benchmarks (including Pyth Network and Chainlink feeds). Prices reflect real-world spot movements and sub-second market volatility.',
      tags: ['Oracles', 'Pyth', 'Price Feeds'],
    },
    {
      id: 'faq-4',
      category: 'guide',
      categories: ['all', 'guide', 'faq'],
      question: 'How do I get starting funds to paper trade?',
      answer:
        'When you connect an Ethereum Sepolia wallet for the first time, our smart faucet automatically provisions 100,000 USDTP in simulated liquidity directly into your account on Sepolia. You can verify your balance instantly on the Portfolio page.',
      tags: ['Onboarding', 'Testnet Funds'],
    },
    {
      id: 'faq-5',
      category: 'api',
      categories: ['all', 'api'],
      question: 'How do I authenticate programmatic requests with the REST API?',
      answer:
        'Generate an API key from the API Keys manager (/api). In your HTTP client, pass the header "x-api-key: YOUR_KEY" along with standard JSON content headers. All requests are authenticated and bounded by your tier rate limits.',
      tags: ['API Keys', 'REST', 'Authentication'],
    },
    {
      id: 'faq-6',
      category: 'api',
      categories: ['all', 'api'],
      question: 'What are the developer API rate limits?',
      answer:
        'Standard testnet developer keys are provisioned with 60 requests per minute and burst capacity up to 120 RPM. High-frequency backtesting desks can request elevated institutional quota through the developer console.',
      tags: ['Rate Limits', 'Quotas'],
    },
    {
      id: 'faq-7',
      category: 'guide',
      categories: ['all', 'guide'],
      question: 'Can I connect algorithmic trading bots written in Python, Rust, or Node.js?',
      answer:
        'Yes. PaperDEX REST endpoints comply with standard OpenAPI v3 specifications. You can fetch market orderbooks, inspect spot quotes, monitor account holdings, and submit atomic trades using any HTTP-capable programming language.',
      tags: ['Bots', 'Algo Trading', 'SDK'],
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      return (
        selectedCategory === 'all' ||
        faq.category === selectedCategory ||
        (Array.isArray(faq.categories) && faq.categories.includes(selectedCategory))
      );
    });
  }, [faqs, selectedCategory]);

  const curlSnippet = `curl -X GET "https://api.paperdex.internal/v2/markets" \\
  -H "x-api-key: pdx_live_98a72b83c1e948" \\
  -H "Accept: application/json"`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleFaq = (id) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>
      
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)',
          border: '1px solid rgba(15, 15, 15, 0.08)',
          borderRadius: '16px',
          padding: '40px 36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(180, 83, 9, 0.1)',
                color: '#B45309',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <KnowledgeIcon size={14} color="#B45309" />
              <span>Knowledge Center</span>
            </span>
            <span style={{ fontSize: '12px', color: '#888' }}>·</span>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
              Architecture & Documentation Hub
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              color: '#0F0F0F',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            How PaperDEX Powers Zero-Risk Decentralized Trading.
          </h1>

          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
            Learn what PaperDEX does, how our real-world oracle infrastructure works, how to navigate
            zero-gas EIP-712 paper trading, and how to integrate programmatic trading bots via our REST API.
          </p>
        </div>
      </section>

      {/* Section 1: What Our Company Does (Platform Architecture & Mission) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
            Platform Architecture
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#0F0F0F', letterSpacing: '-0.02em', margin: 0 }}>
            What PaperDEX Does
          </h2>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
            Core infrastructure components designed to simulate real decentralized exchange environments with cryptographic authenticity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Card 1 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(5, 150, 105, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GlobeIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                Live Real-World Oracle Feeds
              </h3>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '6px 0 0' }}>
                PaperDEX streams decentralized benchmark pricing (Pyth Network & Chainlink feeds) directly into our testnet execution engine. Quotes for BTCP, ETHP, and SOLP mirror genuine mainnet markets in real time.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(217, 119, 6, 0.1)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZapIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                Zero-Gas EIP-712 Relayer
              </h3>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '6px 0 0' }}>
                Traders never spend real Sepolia ETH on transaction fees. Every trade is signed off-chain as a typed EIP-712 payload. Our relayer validates the signature and settles it on-chain with zero gas cost to you.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodeIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                Programmatic REST APIs
              </h3>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '6px 0 0' }}>
                Algorithmic trading desks and bot developers can access programmatic endpoints to query tick data, stream market depth, audit historical transactions, and execute automated simulated orders.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(124, 58, 237, 0.1)',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                Deterministic Risk Isolation
              </h3>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '6px 0 0' }}>
                Evaluate slippage, stress-test automated bots during high-volatility events, and verify smart order routing without incurring financial drawdown or real-world liquidation risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Step-by-Step Onboarding Guide ("How to Use") */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
            Getting Started
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#0F0F0F', letterSpacing: '-0.02em', margin: 0 }}>
            How to Use PaperDEX
          </h2>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
            Five simple steps to connect, fund your test account, execute paper trades, and build bots.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Step 1 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0F0F0F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              1
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                  Connect your Web3 Wallet
                </h4>
                <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>MetaMask / Coinbase / Rabby</span>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                Click <strong>Connect Wallet</strong> on the top right. PaperDEX communicates over Ethereum Sepolia testnet. No testnet ETH balance is required to sign sessions.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0F0F0F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              2
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                  Automatic $100,000 USDTP Provisioning
                </h4>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Instant Test Funds</span>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                Upon your first wallet connection, your account is immediately credited with 100,000 USDTP simulated tokens. Inspect your balance anytime on the <Link href="/portfolio" style={{ color: '#0F0F0F', fontWeight: 600 }}>Portfolio Holdings</Link> page.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0F0F0F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              3
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                  Analyze Spot Valuations on the Markets Desk
                </h4>
                <Link href="/markets" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Open Markets</span>
                  <ExternalLinkIcon size={12} />
                </Link>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                View real-time mark prices for BTCP, ETHP, and SOLP. Check 24-hour highs, lows, price delta, and market liquidity depth streamed via live oracles.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0F0F0F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              4
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                  Execute Gasless EIP-712 Trades
                </h4>
                <Link href="/trade" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Launch Trade Desk</span>
                  <ExternalLinkIcon size={12} />
                </Link>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                Head over to the <Link href="/trade" style={{ color: '#0F0F0F', fontWeight: 600 }}>Trade Desk</Link>. Select an asset pair, enter your trade quantity, and approve the signature prompt in your wallet. The trade settles immediately with zero gas cost.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0F0F0F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              5
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                  Create API Keys for Algorithmic Automation
                </h4>
                <Link href="/api" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Manage Keys</span>
                  <ExternalLinkIcon size={12} />
                </Link>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                Generate secure programmatic tokens in <Link href="/api" style={{ color: '#0F0F0F', fontWeight: 600 }}>API Keys</Link>. Review the endpoints in <Link href="/docs" style={{ color: '#0F0F0F', fontWeight: 600 }}>API Documentation</Link> to connect your custom trading bots and scripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: AWS-Style Service Directory Portals */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
            Portals & Resources
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#0F0F0F', letterSpacing: '-0.02em', margin: 0 }}>
            Explore Platform Features
          </h2>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
            Direct access to all trading terminals, documentation, key managers, and tools.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const cardInner = (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(15, 15, 15, 0.04)',
                        color: link.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#666',
                        background: 'rgba(15, 15, 15, 0.04)',
                        border: '1px solid rgba(15, 15, 15, 0.08)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {link.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
                    {link.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {link.desc}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#0F0F0F',
                  }}
                >
                  <span>{link.isCli ? 'Open Terminal' : 'Launch Portal'}</span>
                  <ExternalLinkIcon size={12} color="#888" />
                </div>
              </>
            );

            const cardStyle = {
              textDecoration: 'none',
              background: '#FFFFFF',
              border: '1px solid rgba(15, 15, 15, 0.08)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              width: '100%',
            };

            if (link.isCli) {
              return (
                <button
                  key={link.title}
                  type="button"
                  onClick={() => setTerminalOpen((p) => !p)}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  {cardInner}
                </button>
              );
            }

            return (
              <Link
                key={link.title}
                href={link.href}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
                }}
              >
                {cardInner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 4: Interactive API Quickstart */}
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(15, 15, 15, 0.08)',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <CodeIcon size={15} color="#0284C7" />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0284C7' }}>
                Developer Quickstart
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F0F0F', margin: 0 }}>
              Query Real-Time Markets via REST API
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
              Use your API key to fetch live ticker prices and liquidity statistics from any HTTP client.
            </p>
          </div>

          <Link
            href="/docs"
            style={{
              textDecoration: 'none',
              background: '#0F0F0F',
              color: '#FFFFFF',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Read Full API Docs</span>
            <ExternalLinkIcon size={12} color="#FFFFFF" />
          </Link>
        </div>

        {/* Code Box */}
        <div
          style={{
            background: '#111827',
            borderRadius: '10px',
            padding: '16px 20px',
            position: 'relative',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF' }}>bash / curl</span>
            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                color: copiedCode ? '#34D399' : '#D1D5DB',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedCode ? <CheckIcon size={13} color="#34D399" /> : <CopyIcon size={13} color="#D1D5DB" />}
              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', color: '#E5E7EB', lineHeight: 1.6 }}>
            <code>{curlSnippet}</code>
          </pre>
        </div>
      </section>

      {/* Section 5: AWS-Style Frequently Asked Questions (Accordion) */}
      <section id="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
              Knowledge Base & FAQs
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#0F0F0F', letterSpacing: '-0.02em', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: isSelected ? '#0F0F0F' : 'rgba(15, 15, 15, 0.04)',
                    color: isSelected ? '#FFFFFF' : '#666',
                    border: '1px solid',
                    borderColor: isSelected ? '#0F0F0F' : 'rgba(15, 15, 15, 0.08)',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-${faq.id}`}
                  style={{
                    background: faq.featured ? '#FFFEFA' : '#FFFFFF',
                    border: faq.featured
                      ? '1px solid rgba(217, 119, 6, 0.35)'
                      : '1px solid rgba(15, 15, 15, 0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    boxShadow: faq.featured ? '0 2px 10px rgba(217, 119, 6, 0.06)' : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isExpanded
                        ? faq.featured
                          ? 'rgba(217, 119, 6, 0.04)'
                          : 'rgba(15, 15, 15, 0.02)'
                        : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          color: isExpanded ? (faq.featured ? '#D97706' : '#0F0F0F') : '#888',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                          transition: 'transform 0.18s ease',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        <ChevronRightIcon size={14} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F0F0F' }}>
                        {faq.question}
                      </span>
                      {faq.featured && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#D97706',
                            background: 'rgba(217, 119, 6, 0.12)',
                            border: '1px solid rgba(217, 119, 6, 0.25)',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Common Question
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {faq.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px',
                            color: '#888',
                            background: 'rgba(15, 15, 15, 0.04)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 20px 18px 46px',
                        fontSize: '13px',
                        color: '#555',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(15, 15, 15, 0.04)',
                        paddingTop: '14px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(15, 15, 15, 0.08)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#BBB', marginBottom: '8px' }}>
                <QuestionIcon size={24} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#333' }}>
                No articles matching &quot;{searchQuery}&quot;
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
                Try searching with broader terms or clear the filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Help & Telemetry Banner */}
      <section
        style={{
          borderTop: '1px solid rgba(15, 15, 15, 0.08)',
          paddingTop: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: '#888',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={15} color="#059669" />
          <span>PaperDEX Core Telemetry: <strong>All Oracle Benchmarks Operational</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/docs" style={{ color: '#666', textDecoration: 'none' }}>
            API Reference
          </Link>
          <Link href="/api" style={{ color: '#666', textDecoration: 'none' }}>
            API Keys
          </Link>
          <Link href="/markets" style={{ color: '#666', textDecoration: 'none' }}>
            Live Markets
          </Link>
        </div>
      </section>

    </div>
  );
}
