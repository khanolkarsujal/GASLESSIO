export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_CHAIN_HEX = '0x14a34';

export const BADGES = [
  {
    id:     'explorer',
    name:   'Explorer',
    icon:   '🌐',
    desc:   'Your first on-chain credential. Zero ETH — just connect and claim.',
    colors: ['#2563eb', '#6366f1'],
    rarity: 'Common',
  },
  {
    id:     'builder',
    name:   'Builder',
    icon:   '⚙️',
    desc:   'For devs and creators actively building on Base. Proof of craft.',
    colors: ['#6366f1', '#db2777'],
    rarity: 'Rare',
  },
  {
    id:     'pioneer',
    name:   'Pioneer',
    icon:   '🚀',
    desc:   'Early adopters who proved gasless UX actually works. Earned, not bought.',
    colors: ['#d97706', '#dc2626'],
    rarity: 'Epic',
  },
];

export const UGF_STEPS = [
  { id: 1, label: 'Verify identity',   sub: 'EIP-191 wallet signature → JWT' },
  { id: 2, label: 'Price the action',  sub: 'UGF quotes gas in TYI Mock USD' },
  { id: 3, label: 'Authorize payment', sub: 'ERC-3009 signature — no ETH sent' },
  { id: 4, label: 'Sponsor & execute', sub: 'UGF posts tx, confirms on-chain' },
];

export const HOW_IT_WORKS = [
  { icon: '💬', step: 'Quote',   desc: 'UGF prices your action in TYI Mock USD — fully transparent.' },
  { icon: '✍️', step: 'Settle',  desc: 'You sign an ERC-3009 authorization. No ETH ever leaves your wallet.' },
  { icon: '⚡', step: 'Execute', desc: 'UGF sponsors ETH gas and submits your transaction on-chain.' },
  { icon: '✅', step: 'Confirm', desc: 'Your badge is minted on Base Sepolia — permanently, provably yours.' },
];
