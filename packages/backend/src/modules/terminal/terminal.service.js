import env from '../../config/env.js';
import { tokenizeCommand, parseCurlArgs } from './terminal.parser.js';

const LOCAL_ORIGIN = `http://localhost:${env.PORT}`;

const ALLOWED_COMMANDS = new Set([
  'curl',
  'pdx',
  'paperdex',
  'help',
  'examples',
  'clear',
  'cls',
  'version',
  'echo',
]);

/**
 * Formats JSON or text as a formatted PowerShell console string.
 */
function formatHeaderAndBody(status, statusText, headers, body) {
  const lines = [`HTTP/1.1 ${status} ${statusText}`];
  if (headers['content-type']) {
    lines.push(`Content-Type: ${headers['content-type']}`);
  }
  lines.push(`Date: ${new Date().toUTCString()}`);
  lines.push('');

  let formattedBody = body;
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    formattedBody = JSON.stringify(parsed, null, 2);
  } catch {
    // Keep as string
  }

  lines.push(formattedBody);
  return lines.join('\n');
}

/**
 * Generates an ASCII table from an array of objects.
 */
function formatAsciiTable(headers, rows) {
  const colWidths = headers.map((h, i) => {
    const maxVal = Math.max(...rows.map((r) => String(r[i] ?? '').length));
    return Math.max(h.length, maxVal);
  });

  const sepTop = '┌─' + colWidths.map((w) => '─'.repeat(w)).join('─┬─') + '─┐';
  const sepMid = '├─' + colWidths.map((w) => '─'.repeat(w)).join('─┼─') + '─┤';
  const sepBot = '└─' + colWidths.map((w) => '─'.repeat(w)).join('─┴─') + '─┘';

  const headerRow = '│ ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ') + ' │';
  const dataRows = rows.map(
    (row) => '│ ' + row.map((cell, i) => String(cell ?? '').padEnd(colWidths[i])).join(' │ ') + ' │',
  );

  return [sepTop, headerRow, sepMid, ...dataRows, sepBot].join('\n');
}

/**
 * Handle curl execution supporting both local PaperDEX endpoints and external endpoints.
 */
async function handleCurl(tokens, defaultAuthHeader = null) {
  const parsed = parseCurlArgs(tokens);
  if (!parsed.url) {
    return {
      output: 'curl: try \'curl --help\' for more information\ncurl: no URL specified!',
      isError: true,
    };
  }

  let fullUrl = parsed.url;

  // Resolve target URL: support relative paths, localhost, and external domains
  if (fullUrl.startsWith('/')) {
    fullUrl = `${LOCAL_ORIGIN}${fullUrl}`;
  } else if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    if (fullUrl.startsWith('localhost')) {
      fullUrl = `http://${fullUrl}`;
    } else {
      fullUrl = `https://${fullUrl}`;
    }
  }

  // If user didn't specify Authorization header in curl command, attach session auth for PaperDEX targets
  const requestHeaders = { ...parsed.headers };
  if (!requestHeaders['Authorization'] && !requestHeaders['authorization'] && defaultAuthHeader) {
    if (fullUrl.includes('localhost') || fullUrl.includes('paperdex') || fullUrl.includes('paper-dex')) {
      requestHeaders['Authorization'] = defaultAuthHeader;
    }
  }

  if (!requestHeaders['Content-Type'] && !requestHeaders['content-type'] && parsed.body) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Set standard User-Agent so external APIs (Vercel, CoinGecko, etc.) accept the request
  if (!requestHeaders['User-Agent'] && !requestHeaders['user-agent']) {
    requestHeaders['User-Agent'] = 'curl/8.4.0 PaperDEX-Terminal/2.0';
  }

  try {
    const fetchOptions = {
      method: parsed.method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000), // 15-second timeout for external queries
    };

    if (parsed.body && parsed.method !== 'GET' && parsed.method !== 'HEAD') {
      fetchOptions.body = parsed.body;
    }

    const res = await fetch(fullUrl, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    const resText = await res.text();

    const formatted = formatHeaderAndBody(
      res.status,
      res.statusText || (res.ok ? 'OK' : 'Error'),
      { 'content-type': contentType },
      resText,
    );

    return {
      output: formatted,
      isError: !res.ok,
      status: res.status,
    };
  } catch (err) {
    return {
      output: `curl: (6) Could not resolve host or connection failed: ${err.message}`,
      isError: true,
    };
  }
}


/**
 * Handle high-level pdx shorthand commands.
 */
async function handlePdx(tokens, defaultAuthHeader = null) {
  const sub = tokens[1]?.toLowerCase();

  if (!sub || sub === 'help') {
    return {
      output: `PaperDEX CLI Tool (pdx) - Quick Command Reference:
  pdx markets               List live spot prices and 24h stats for all tokens
  pdx markets <symbol>      Get market statistics for BTCP, ETHP, SOLP, or USDTP
  pdx portfolio             Display on-chain holdings and total portfolio valuation
  pdx trade --token <T> --side <BUY|SELL> --amount <A>
                            Execute an atomic trade order
  pdx keys                  List your active API keys

Use "curl -X ..." for standard raw HTTP API testing.`,
      isError: false,
    };
  }

  if (sub === 'markets') {
    const symbol = tokens[2]?.toUpperCase();
    const url = symbol ? `/api/v2/markets/${symbol}` : '/api/v2/markets';
    const curlResult = await handleCurl(['curl', url], defaultAuthHeader);

    if (curlResult.isError) return curlResult;

    try {
      const jsonStart = curlResult.output.indexOf('{');
      const data = JSON.parse(curlResult.output.slice(jsonStart)).data;

      if (Array.isArray(data)) {
        const rows = data.map((m) => [
          m.symbol,
          `$${Number(m.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          `${m.change24h >= 0 ? '+' : ''}${m.change24h}%`,
          m.volume24h ? `$${(m.volume24h / 1e9).toFixed(2)}B` : '—',
        ]);
        return {
          output: formatAsciiTable(['SYMBOL', 'PRICE (USD)', '24H CHANGE', '24H VOLUME'], rows),
          isError: false,
        };
      } else {
        const rows = [
          ['Symbol', data.symbol],
          ['Price', `$${Number(data.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['24h Change', `${data.change24h >= 0 ? '+' : ''}${data.change24h}%`],
        ];
        return {
          output: formatAsciiTable(['PROPERTY', 'VALUE'], rows),
          isError: false,
        };
      }
    } catch {
      return curlResult;
    }
  }

  if (sub === 'portfolio') {
    const curlResult = await handleCurl(['curl', '/api/v2/portfolio'], defaultAuthHeader);
    if (curlResult.isError) return curlResult;

    try {
      const jsonStart = curlResult.output.indexOf('{');
      const data = JSON.parse(curlResult.output.slice(jsonStart)).data;

      if (Array.isArray(data)) {
        let totalUsd = 0;
        const rows = data.map((h) => {
          const val = parseFloat(h.usdValue) || 0;
          totalUsd += val;
          return [
            h.symbol,
            parseFloat(h.balance).toFixed(4),
            h.price ? `$${Number(h.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
            h.usdValue ? `$${Number(h.usdValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
          ];
        });

        const table = formatAsciiTable(['ASSET', 'BALANCE', 'SPOT PRICE', 'USD VALUE'], rows);
        const footer = `\nTotal Estimated Valuation: $${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        return { output: table + footer, isError: false };
      }
      return curlResult;
    } catch {
      return curlResult;
    }
  }

  if (sub === 'trade') {
    let token, side, amount;
    for (let i = 2; i < tokens.length; i++) {
      if (tokens[i] === '--token' && i + 1 < tokens.length) token = tokens[++i].toUpperCase();
      if (tokens[i] === '--side' && i + 1 < tokens.length) side = tokens[++i].toUpperCase();
      if (tokens[i] === '--amount' && i + 1 < tokens.length) amount = tokens[++i];
    }

    if (!token || !side || !amount) {
      return {
        output: 'Error: Missing parameters for trade.\nUsage: pdx trade --token <BTCP|ETHP|SOLP> --side <BUY|SELL> --amount <0.1>',
        isError: true,
      };
    }

    const payload = JSON.stringify({ token, side, amount });
    const curlResult = await handleCurl(
      ['curl', '-X', 'POST', '/api/v2/trade', '-H', 'Content-Type: application/json', '-d', payload],
      defaultAuthHeader,
    );

    if (curlResult.isError) return curlResult;

    try {
      const jsonStart = curlResult.output.indexOf('{');
      const data = JSON.parse(curlResult.output.slice(jsonStart)).data;
      return {
        output: `Trade Executed Successfully!\nStatus: CONFIRMED on Sepolia\nTxHash: ${data.txHash}\nSide: ${data.side} ${data.amount} ${data.token} @ $${data.price}\nTotal Value: $${data.usdValue}`,
        isError: false,
      };
    } catch {
      return curlResult;
    }
  }

  return {
    output: `pdx: unknown subcommand '${sub}'. Type 'pdx help' for available commands.`,
    isError: true,
  };
}

/**
 * Main command execution entrypoint.
 *
 * @param {string} cmdStr            - Raw CLI command line from frontend
 * @param {string|null} defaultAuth  - Optional session token or API key for convenience
 */
export const executeTerminalCommand = async (cmdStr, defaultAuth = null) => {
  const tokens = tokenizeCommand(cmdStr);
  if (tokens.length === 0) {
    return { output: '', isError: false };
  }

  const root = tokens[0].toLowerCase();

  if (!ALLOWED_COMMANDS.has(root)) {
    return {
      output: `The term '${root}' is not recognized as a cmdlet, function, or operable program.\nOnly PaperDEX API test commands are allowed in this sandbox.\nType "help" to see available commands.`,
      isError: true,
    };
  }

  if (root === 'clear' || root === 'cls') {
    return { output: '', action: 'clear', isError: false };
  }

  if (root === 'echo') {
    return { output: tokens.slice(1).join(' '), isError: false };
  }

  if (root === 'version') {
    return {
      output: `PaperDEX Terminal Engine v2.0.4 [PowerShell Sandbox Edition]
Host OS: Windows / WebAssembly
Target API: http://localhost:5000/api/v2
Rate Limiting: Active (300 req/15m read, 100 req/15m trade)
Status: Online`,
      isError: false,
    };
  }

  if (root === 'help') {
    return {
      output: `PowerShell PaperDEX CLI — API Testing Console

Available Commands:
  curl <args>             Send raw HTTP requests to PaperDEX endpoints
                          Examples:
                            curl -X GET /api/v2/markets
                            curl -X GET /api/v2/portfolio -H "Authorization: pdx_id_...:pdx_secret_..."
                            curl -X POST /api/v2/trade -d '{"token":"BTCP","side":"BUY","amount":"0.1"}'

  pdx <subcommand>        Fast PaperDEX helper utilities
                          Subcommands: markets, portfolio, trade, help

  examples                View copy-pasteable API testing templates
  clear / cls             Clear the terminal screen
  version                 Print CLI runtime & API version
  echo <text>             Print text to console

Tips:
  - Use Up/Down arrows to navigate previous command history.
  - Click "+" at top to open multiple concurrent terminal sessions.
  - Tab outputs are preserved across navigation.`,
      isError: false,
    };
  }

  if (root === 'examples') {
    return {
      output: `API Testing Command Examples (Click or copy to run):

1. Get all markets:
   curl -X GET /api/v2/markets

2. Get Bitcoin market:
   curl -X GET /api/v2/markets/BTCP

3. Get portfolio balances (with API key):
   curl -X GET /api/v2/portfolio -H "Authorization: pdx_id_<KEY_ID>:<SECRET>"

4. Execute spot BUY:
   curl -X POST /api/v2/trade -H "Authorization: pdx_id_<KEY_ID>:<SECRET>" -d '{"token":"BTCP","side":"BUY","amount":"0.1"}'

5. Fast CLI table:
   pdx markets`,
      isError: false,
    };
  }

  if (root === 'curl') {
    return await handleCurl(tokens, defaultAuth);
  }

  if (root === 'pdx' || root === 'paperdex') {
    return await handlePdx(tokens, defaultAuth);
  }

  return {
    output: `Command '${root}' recognized but not supported.`,
    isError: true,
  };
};
