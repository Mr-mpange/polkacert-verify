/**
 * Subscan API Integration for Polkadot Blockchain Explorer
 * Provides enhanced blockchain verification and transaction tracking
 */

const SUBSCAN_API_ENDPOINTS = {
  westend: 'https://westend.api.subscan.io',
  polkadot: 'https://polkadot.api.subscan.io',
  kusama: 'https://kusama.api.subscan.io',
  rococo: 'https://rococo.api.subscan.io',
};

export type Network = keyof typeof SUBSCAN_API_ENDPOINTS;

interface SubscanConfig {
  network: Network;
  apiKey?: string; // Optional API key for higher rate limits
}

// Default configuration
let config: SubscanConfig = {
  network: 'westend',
  apiKey: import.meta.env.VITE_SUBSCAN_API_KEY,
};

/**
 * Configure Subscan API
 */
export function configureSubscan(newConfig: Partial<SubscanConfig>) {
  config = { ...config, ...newConfig };
}

/**
 * Get current Subscan configuration
 */
export function getSubscanConfig(): SubscanConfig {
  return { ...config };
}

/**
 * Make API request to Subscan
 */
async function subscanRequest<T>(
  endpoint: string,
  data?: Record<string, any>
): Promise<T> {
  const baseUrl = SUBSCAN_API_ENDPOINTS[config.network];
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Subscan API error: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.code !== 0) {
    throw new Error(`Subscan API error: ${result.message}`);
  }

  return result.data;
}

/**
 * Transaction details from Subscan
 */
export interface TransactionDetails {
  block_num: number;
  block_timestamp: number;
  extrinsic_index: string;
  call_module: string;
  call_module_function: string;
  account_id: string;
  signature: string;
  nonce: number;
  extrinsic_hash: string;
  success: boolean;
  fee: string;
  fee_used: string;
  from_hex: string;
  finalized: boolean;
  account_display?: {
    address: string;
    display?: string;
    identity?: boolean;
  };
  params?: Array<{
    name: string;
    type: string;
    value: any;
  }>;
}

/**
 * Get transaction details by hash
 */
export async function getTransactionDetails(
  txHash: string
): Promise<TransactionDetails> {
  return subscanRequest<TransactionDetails>('/api/scan/extrinsic', {
    hash: txHash,
  });
}

/**
 * Block information from Subscan
 */
export interface BlockInfo {
  block_num: number;
  block_timestamp: number;
  hash: string;
  parent_hash: string;
  state_root: string;
  extrinsics_root: string;
  extrinsics_count: number;
  event_count: number;
  finalized: boolean;
  validator?: string;
  validator_name?: string;
}

/**
 * Get block information by block number or hash
 */
export async function getBlockInfo(
  blockIdentifier: number | string
): Promise<BlockInfo> {
  const data = typeof blockIdentifier === 'number'
    ? { block_num: blockIdentifier }
    : { block_hash: blockIdentifier };

  return subscanRequest<BlockInfo>('/api/scan/block', data);
}

/**
 * Account information from Subscan
 */
export interface AccountInfo {
  address: string;
  balance: string;
  balance_lock: string;
  bonded: string;
  unbonding: string;
  democracy_lock: string;
  election_lock: string;
  nonce: number;
  account_display?: {
    address: string;
    display?: string;
    identity?: boolean;
    parent?: {
      address: string;
      display?: string;
      identity?: boolean;
    };
  };
}

/**
 * Get account information
 */
export async function getAccountInfo(address: string): Promise<AccountInfo> {
  return subscanRequest<AccountInfo>('/api/scan/account', {
    address,
  });
}

/**
 * Transaction in account history
 */
export interface AccountTransaction {
  block_num: number;
  block_timestamp: number;
  extrinsic_index: string;
  call_module: string;
  call_module_function: string;
  hash: string;
  success: boolean;
  fee: string;
  from: string;
  to?: string;
  amount?: string;
  nonce: number;
  finalized: boolean;
}

/**
 * Get account transaction history
 */
export async function getAccountTransactions(
  address: string,
  page: number = 0,
  row: number = 20
): Promise<{
  count: number;
  extrinsics: AccountTransaction[];
}> {
  return subscanRequest('/api/scan/extrinsics', {
    address,
    page,
    row,
  });
}

/**
 * Search for extrinsics containing specific remark data
 */
export async function searchRemarkExtrinsics(
  remarkData: string,
  page: number = 0,
  row: number = 20
): Promise<{
  count: number;
  extrinsics: AccountTransaction[];
}> {
  return subscanRequest('/api/scan/extrinsics', {
    call: 'remark',
    page,
    row,
  });
}

/**
 * Verify certificate hash exists on blockchain via Subscan
 */
export async function verifyCertificateHashOnChain(
  certificateHash: string,
  txHash?: string
): Promise<{
  exists: boolean;
  transaction?: TransactionDetails;
  block?: BlockInfo;
  verified: boolean;
}> {
  try {
    if (!txHash) {
      // If no transaction hash provided, we can't verify via Subscan
      return {
        exists: false,
        verified: false,
      };
    }

    // Get transaction details
    const transaction = await getTransactionDetails(txHash);

    // Check if transaction was successful
    if (!transaction.success) {
      return {
        exists: false,
        transaction,
        verified: false,
      };
    }

    // Get block information
    const block = await getBlockInfo(transaction.block_num);

    // Check if the remark contains our certificate hash
    const remarkParam = transaction.params?.find(p => p.name === 'remark');
    const remarkValue = remarkParam?.value;

    // The remark should contain our certificate hash
    const hashExists = remarkValue && 
      (remarkValue === certificateHash || 
       remarkValue.includes(certificateHash.replace('0x', '')));

    return {
      exists: hashExists || false,
      transaction,
      block,
      verified: hashExists && transaction.finalized,
    };
  } catch (error) {
    console.error('Error verifying certificate on Subscan:', error);
    return {
      exists: false,
      verified: false,
    };
  }
}

/**
 * Get blockchain explorer URL for transaction
 */
export function getTransactionUrl(txHash: string): string {
  const baseUrl = SUBSCAN_API_ENDPOINTS[config.network].replace('.api', '');
  return `${baseUrl}/extrinsic/${txHash}`;
}

/**
 * Get blockchain explorer URL for block
 */
export function getBlockUrl(blockIdentifier: number | string): string {
  const baseUrl = SUBSCAN_API_ENDPOINTS[config.network].replace('.api', '');
  return `${baseUrl}/block/${blockIdentifier}`;
}

/**
 * Get blockchain explorer URL for account
 */
export function getAccountUrl(address: string): string {
  const baseUrl = SUBSCAN_API_ENDPOINTS[config.network].replace('.api', '');
  return `${baseUrl}/account/${address}`;
}

/**
 * Network statistics from Subscan
 */
export interface NetworkStats {
  block_num: number;
  finalized_block_num: number;
  block_time: number;
  total_issuance: string;
  validator_count: number;
  nominator_count: number;
}

/**
 * Get network statistics
 */
export async function getNetworkStats(): Promise<NetworkStats> {
  return subscanRequest<NetworkStats>('/api/scan/metadata');
}

/**
 * Format balance from Subscan (planck to DOT/WND)
 */
export function formatBalance(balance: string, decimals: number = 12): string {
  const value = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 4);
  return `${whole}.${fractionStr}`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Check if Subscan API is available
 */
export async function checkSubscanHealth(): Promise<boolean> {
  try {
    await getNetworkStats();
    return true;
  } catch (error) {
    console.error('Subscan health check failed:', error);
    return false;
  }
}
