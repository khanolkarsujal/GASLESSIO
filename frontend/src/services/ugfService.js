import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../contractConfig';
import { UGFClient, UGFError } from '@tychilabs/ugf-testnet-js';

// Contract interface
const CONTRACT_ABI = [
  'function claimBadge(address recipient, uint8 badgeType) external returns (uint256)',
  'function totalMinted() external view returns (uint256)',
  'function remaining() external view returns (uint256)',
  'function getBadgeType(uint256 tokenId) external view returns (uint8)',
  'event BadgeClaimed(address indexed recipient, uint256 indexed tokenId, uint8 indexed badgeType)',
];

// Cache UGF client instance and contract interface
let cachedUGFClient = null;
let cachedInterface = null;

function getUGFClient() {
  if (!cachedUGFClient) {
    cachedUGFClient = new UGFClient();
  }
  return cachedUGFClient;
}

function getContractInterface() {
  if (!cachedInterface) {
    cachedInterface = new ethers.Interface(CONTRACT_ABI);
  }
  return cachedInterface;
}

// ── Public data functions ──────────────────────────────────────────────────────

export async function getCollectionStats(provider) {
  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const [minted, remaining] = await Promise.all([
      c.totalMinted(), c.remaining(),
    ]);
    return { minted: Number(minted), remaining: Number(remaining), total: 10_000 };
  } catch {
    return { minted: 0, remaining: 10_000, total: 10_000 };
  }
}

export async function getClaimedBadges(provider, address) {
  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const filter = c.filters.BadgeClaimed(address);
    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - 500_000);
    const events = await c.queryFilter(filter, fromBlock, 'latest');
    return events.map(e => ({
      tokenId: Number(e.args.tokenId),
      badgeType: Number(e.args.badgeType),
      txHash:  e.transactionHash,
      block:   e.blockNumber,
    }));
  } catch {
    return [];
  }
}

// ── Core gasless claim ─────────────────────────────────────────────────────────

/**
 * Execute a gasless NFT badge claim via UGF.
 *
 * UGF Flow (No paymasters. No bundlers. No ERC-4337.):
 *  1. Auth    — EIP-191 wallet sign → JWT
 *  2. Quote   — tx calldata → digest + TYI settlement amount
 *  3. Settle  — ERC-3009 TYI_MOCK_USD signature (no ETH from user)
 *  4. Execute — UGF sponsors gas, claimBadge(recipient, badgeType) lands on-chain
 *
 * @param {ethers.Signer} signer    Connected signer (Base Sepolia required)
 * @param {number}        badgeType The badge type ID (0 = Explorer, 1 = Builder, 2 = Pioneer)
 * @param {Function}      onProgress Progress callback: receives percentage (0-100)
 * @returns {Promise<string>}       Confirmed on-chain tx hash
 */
export async function executeGaslessClaim(signer, badgeType, onProgress = () => {}) {
  const client       = getUGFClient();
  const iface        = getContractInterface();
  
  // Ultra-fast parallel initialization
  const [payerAddress] = await Promise.all([
    signer.getAddress(),
  ]);

  // Continuous non-stop progress from 0%
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 95) {
      progress += 2;
      onProgress(progress);
    }
  }, 150);

  // ── 1. Authenticate ──────────────────────────────────────────────────────────
  try {
    await client.auth.login(signer);
  } catch (err) {
    clearInterval(progressInterval);
    throw new Error(`Authentication failed: ${_msg(err)}`);
  }

  // ── 2. Quote — encode claimBadge(recipient, badgeType) ──────────────────────
  const data  = iface.encodeFunctionData('claimBadge', [payerAddress, badgeType]);
  let quote;
  try {
    quote = await client.quote.get({
      payer_address: payerAddress.toLowerCase(),
      tx_object: JSON.stringify({
        from:  payerAddress.toLowerCase(),
        to:    CONTRACT_ADDRESS.toLowerCase(),
        data,
        value: '0x0',
      }),
    });
  } catch (err) {
    clearInterval(progressInterval);
    throw new Error(`Quote failed: ${_msg(err)}`);
  }

  // ── 3. Settle — ERC-3009 TYI signature (user pays zero ETH) ─────────────────
  try {
    await client.payment.x402.execute({ quote, signer });
  } catch (err) {
    clearInterval(progressInterval);
    const msg = _msg(err);
    if (/400|insufficient|balance|HTTP 4/i.test(msg)) throw new Error('NO_MOCK_USD');
    throw new Error(`Payment failed: ${msg}`);
  }

  // ── 4. Execute — UGF sponsors ETH, confirms on-chain ────────────────────────
  try {
    const { userTxHash } = await client.chains.evm.sponsorAndExecute(
      quote.digest,
      signer,
      async () => ({ to: CONTRACT_ADDRESS.toLowerCase(), data, value: 0n })
    );
    clearInterval(progressInterval);
    onProgress(100);
    return userTxHash;
  } catch (err) {
    clearInterval(progressInterval);
    const msg = _msg(err);
    if (msg.includes('MaxSupplyReached')) throw new Error('MAX_SUPPLY');
    if (msg.includes('ContractPaused'))   throw new Error('PAUSED');
    throw new Error(`Execution failed: ${msg}`);
  }
}

function _msg(err) {
  return err instanceof UGFError ? err.message : (err?.message ?? String(err));
}
