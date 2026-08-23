'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchNonce, loginWithSignature } from '../actions/auth';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

async function ensureSepolia() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId === SEPOLIA_CHAIN_ID) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (err) {
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
      throw new Error('Please switch to Sepolia in MetaMask');
    }
  }
}

export default function ConnectWallet() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const connect = async () => {
    setError('');
    try {
      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask to continue.');
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
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const labels = {
    idle:       'Connect MetaMask',
    connecting: 'Connecting...',
    signing:    'Sign in MetaMask...',
    done:       'Redirecting...',
    error:      'Retry Connection',
  };

  const isLoading = status === 'connecting' || status === 'signing' || status === 'done';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={connect}
        disabled={isLoading}
        className="gs-btn-primary"
        style={{ minWidth: '200px' }}
      >
        {isLoading ? (
          <>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} className="animate-live-dot" />
            {labels[status]}
          </>
        ) : (
          <>
            {labels[status]}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
      {error && (
        <p style={{ fontSize: '12px', color: '#c0392b', maxWidth: '320px', textAlign: 'center', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
