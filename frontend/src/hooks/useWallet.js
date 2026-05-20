import { useState, useEffect, useCallback } from 'react';
import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_HEX } from '../lib/constants';

/**
 * Manages wallet connection state, chain detection, and auto-reconnect.
 * Persists connection across page refreshes via eth_accounts.
 */
export function useWallet() {
  const [account,  setAccount]  = useState('');
  const [chainId,  setChainId]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const isConnected  = !!account;
  const isRightChain = chainId === BASE_SEPOLIA_CHAIN_ID;
  const hasProvider  = typeof window !== 'undefined' && !!window.ethereum;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
      setIsMobile(mobile);
    }
  }, []);

  // ── Listeners ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasProvider) return;

    const onChainChanged  = (hex)    => setChainId(parseInt(hex, 16));
    const onAccountsChanged = ([acct]) => { setAccount(acct ?? ''); };

    window.ethereum.on('chainChanged',    onChainChanged);
    window.ethereum.on('accountsChanged', onAccountsChanged);

    // Auto-reconnect on mount
    Promise.all([
      window.ethereum.request({ method: 'eth_chainId' }),
      window.ethereum.request({ method: 'eth_accounts' }),
    ]).then(([hex, accounts]) => {
      setChainId(parseInt(hex, 16));
      if (accounts[0]) {
        setAccount(accounts[0]);
      } else {
        // If we came from a deep link requesting connection, trigger connect request
        const params = new URLSearchParams(window.location.search);
        if (params.get('connect') === 'true') {
          // Clean up the URL query parameter
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('connect');
          window.history.replaceState({}, '', newUrl.toString());
          
          window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(([acct]) => {
              setAccount(acct);
            })
            .catch((err) => {
              console.error("Auto connect failed:", err);
            });
        }
      }
    }).catch(() => {});

    return () => {
      window.ethereum.removeListener('chainChanged',    onChainChanged);
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    };
  }, [hasProvider]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!hasProvider) {
      if (isMobile) {
        const url = new URL(window.location.href);
        url.searchParams.set('connect', 'true');
        const dappUrl = url.toString().replace(/^https?:\/\//, '');
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
        return;
      }
      setError('no_provider');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [acct] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const hex    = await window.ethereum.request({ method: 'eth_chainId' });
      setAccount(acct);
      setChainId(parseInt(hex, 16));
    } catch (e) {
      if (e.code !== 4001) setError('Connection failed.');
      // 4001 = user rejected — silent
    } finally {
      setLoading(false);
    }
  }, [hasProvider, isMobile]);

  const switchToBaseSepolia = useCallback(async () => {
    if (!hasProvider) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_HEX }],
      });
      // Force update the chain ID state immediately after successful switch
      const hex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(hex, 16));
      return true;
    } catch (e) {
      // 4902 indicates the chain has not been added to MetaMask
      if (e.code === 4902 || e?.message?.includes("Unrecognized chain ID")) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId:         BASE_SEPOLIA_CHAIN_HEX,
              chainName:       'Base Sepolia Testnet',
              nativeCurrency:  { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls:         [
                'https://sepolia.base.org',
                'https://base-sepolia-rpc.publicnode.com',
                'https://sepolia.gateway.tenderly.co'
              ],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
          const hex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(hex, 16));
          return true;
        } catch (addError) {
          console.error("Failed to add Base Sepolia:", addError);
          return false;
        }
      }
      console.error("Failed to switch to Base Sepolia:", e);
      return false;
    }
  }, [hasProvider]);

  const addTYIToken = useCallback(async () => {
    if (!hasProvider) return false;
    try {
      const TYI_ADDRESS = '0x9b9deeea99C2B77c0e7F7bdCf0a01a0F0843e5DD';
      const success = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TYI_ADDRESS,
            symbol: 'TYI',
            decimals: 18,
            image: 'https://raw.githubusercontent.com/tychilabs/ugf-assets/main/tyi-token-logo.png',
          },
        },
      });
      return !!success;
    } catch (e) {
      console.error("Failed to register TYI watchAsset:", e);
      return false;
    }
  }, [hasProvider]);

  return {
    account,
    chainId,
    isConnected,
    isRightChain,
    hasProvider,
    loading,
    error,
    connect,
    switchToBaseSepolia,
    addTYIToken,
    isMobile,
  };
}
