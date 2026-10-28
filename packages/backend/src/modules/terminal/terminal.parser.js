/**
 * Safe command-line lexer for PaperDEX Terminal.
 * Parses CLI strings into tokens without invoking system shells or eval.
 */
export const tokenizeCommand = (cmdStr) => {
  if (!cmdStr || typeof cmdStr !== 'string') return [];

  // Clean PowerShell / Bash line-continuation artifacts (` or \ followed by newline, or >> prompt continuation)
  const cleaned = cmdStr
    .replace(/[`\\]\s*[\r\n]+/g, ' ')
    .replace(/[\r\n]+\s*>>\s*/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const tokens = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];

    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (c === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if ((c === ' ' || c === '\t') && !inDouble && !inSingle) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += c;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
};

/**
 * Parses a tokenized curl command into structured request parameters.
 * E.g. ['curl', '-X', 'POST', 'https://...', '-H', 'Authorization: ...', '-d', '{"token":"BTCP"}']
 */
export const parseCurlArgs = (tokens) => {
  let method = 'GET';
  const headers = {};
  let body = null;
  let url = null;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    // Skip stray line-continuation symbols or prompt markers
    if (token === '\\' || token === '`' || token === '>>' || token === '>') {
      continue;
    }

    if (token === '-X' || token === '--request') {
      if (i + 1 < tokens.length) {
        method = tokens[++i].toUpperCase();
      }
    } else if (token === '-H' || token === '--header') {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx !== -1) {
          const key = headerStr.slice(0, colonIdx).trim();
          const val = headerStr.slice(colonIdx + 1).trim();
          headers[key] = val;
        }
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw') {
      if (i + 1 < tokens.length) {
        body = tokens[++i];
      }
    } else if (token === '-s' || token === '--silent' || token === '-i' || token === '-k' || token === '-L' || token === '--location') {
      // Ignored standard curl display flags
      continue;
    } else if (!token.startsWith('-') && !url) {
      // Strip potential enclosing quotes that might survive tokenization
      url = token.replace(/^["']|["']$/g, '');
    }
  }

  // If method was not explicitly set to POST but a body was provided, default to POST
  if (method === 'GET' && body) {
    method = 'POST';
  }

  return { method, headers, body, url };
};
