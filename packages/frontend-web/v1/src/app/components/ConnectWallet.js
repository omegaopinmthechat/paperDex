'use client';

import { useState } from 'react';
import { fetchNonce, loginWithSignature } from '../actions/auth';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

const btn = {
  background: '#00ff41', color: '#000', border: 'none',
  padding: '14px 36px', fontFamily: 'inherit', fontWeight: 900,
  fontSize: '15px', cursor: 'pointer', letterSpacing: '0.12em',
  textTransform: 'uppercase', display: 'inline-block',
};

const btnOutline = {
  ...btn,
  background: 'transparent', color: '#00ff41',
  border: '2px solid #00ff41',
};

async function ensureSepolia() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId === SEPOLIA_CHAIN_ID) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (err) {
    // Chain not added yet — add it
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: SEPOLIA_CHAIN_ID,
          chainName: 'Sepolia Testnet',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
    } else {
      throw new Error('Please switch to Sepolia network in MetaMask');
    }
  }
}

export default function ConnectWallet() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const connect = async () => {
    setError('');
    try {
      if (!window.ethereum) {
        setError('MetaMask not detected. Install MetaMask to continue.');
        return;
      }

      setStatus('connecting');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      await ensureSepolia();

      setStatus('signing');
      const { message } = await fetchNonce(address);

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      setStatus('done');
      await loginWithSignature(address, signature);
      window.location.href = '/dashboard';
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong');
    }
  };

  const labels = {
    idle: 'CONNECT METAMASK',
    connecting: 'CONNECTING...',
    signing: 'SIGN IN METAMASK...',
    done: 'REDIRECTING...',
    error: 'TRY AGAIN',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
      <button
        style={status === 'idle' || status === 'error' ? btn : btnOutline}
        onClick={connect}
        disabled={status === 'connecting' || status === 'signing' || status === 'done'}
      >
        {labels[status]}
      </button>
      {error && (
        <p style={{ color: '#ff4141', fontFamily: 'inherit', fontSize: '13px', margin: 0, borderLeft: '3px solid #ff4141', paddingLeft: '10px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
