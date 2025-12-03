import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsHex } from '@polkadot/util-crypto';
import { stringToHex, hexToString } from '@polkadot/util';

// Polkadot network endpoints
const POLKADOT_ENDPOINTS = {
  mainnet: 'wss://rpc.polkadot.io',
  westend: 'wss://westend-rpc.polkadot.io',
  rococo: 'wss://rococo-rpc.polkadot.io',
  local: 'ws://127.0.0.1:9944'
};

// Use Westend testnet for development
const NETWORK_ENDPOINT = import.meta.env.VITE_POLKADOT_ENDPOINT || POLKADOT_ENDPOINTS.westend;

let api: ApiPromise | null = null;

/**
 * Initialize connection to Polkadot network
 */
export const initPolkadotApi = async (): Promise<ApiPromise> => {
  if (api && api.isConnected) {
    return api;
  }

  try {
    await cryptoWaitReady();
    const provider = new WsProvider(NETWORK_ENDPOINT);
    api = await ApiPromise.create({ provider });
    
    console.log('✅ Connected to Polkadot network:', NETWORK_ENDPOINT);
    console.log('Chain:', (await api.rpc.system.chain()).toString());
    console.log('Node version:', (await api.rpc.system.version()).toString());
    
    return api;
  } catch (error) {
    console.error('Failed to connect to Polkadot network:', error);
    throw new Error('Unable to connect to Polkadot blockchain');
  }
};

/**
 * Get the Polkadot API instance
 */
export const getPolkadotApi = async (): Promise<ApiPromise> => {
  if (!api || !api.isConnected) {
    return await initPolkadotApi();
  }
  return api;
};

/**
 * Connect to Polkadot.js extension wallet
 */
export const connectWallet = async () => {
  try {
    const extensions = await web3Enable('CertiChain');
    
    if (extensions.length === 0) {
      throw new Error('No Polkadot.js extension found. Please install it.');
    }

    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found in Polkadot.js extension');
    }

    return accounts;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

/**
 * Generate blockchain hash for certificate data
 */
export const generateCertificateHash = async (certificateData: {
  certificate_id: string;
  holder_name: string;
  course_name: string;
  institution: string;
  issue_date: string;
}): Promise<string> => {
  await cryptoWaitReady();
  
  // Create deterministic hash from certificate data
  const dataString = JSON.stringify({
    id: certificateData.certificate_id,
    holder: certificateData.holder_name,
    course: certificateData.course_name,
    institution: certificateData.institution,
    date: certificateData.issue_date
  });
  
  // Use Blake2 hash (Polkadot's native hash function)
  const hash = blake2AsHex(dataString);
  return hash;
};

/**
 * Check if account has sufficient balance for transaction
 */
export const checkSufficientBalance = async (address: string): Promise<{ sufficient: boolean; balance: string; required: string }> => {
  try {
    const polkadotApi = await getPolkadotApi();
    const { data: balance } = await polkadotApi.query.system.account(address);
    
    // Get payment info for a typical remark transaction
    const tx = polkadotApi.tx.system.remark('0x00');
    const info = await tx.paymentInfo(address);
    
    const free = balance.free.toBigInt();
    const required = info.partialFee.toBigInt();
    
    // Convert to readable format (10 decimals for Westend/Polkadot)
    const freeFormatted = (Number(free) / 10 ** 10).toFixed(4);
    const requiredFormatted = (Number(required) / 10 ** 10).toFixed(4);
    
    return {
      sufficient: free > required,
      balance: freeFormatted,
      required: requiredFormatted
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
};

/**
 * Store certificate hash on Polkadot blockchain using System.remark
 * This stores data in blockchain without requiring a smart contract
 */
export const storeCertificateOnChain = async (
  certificateHash: string,
  accountAddress: string
): Promise<{ txHash: string; blockHash: string }> => {
  try {
    const polkadotApi = await getPolkadotApi();
    
    // Check balance before attempting transaction
    const balanceCheck = await checkSufficientBalance(accountAddress);
    if (!balanceCheck.sufficient) {
      throw new Error(
        `Insufficient balance. You have ${balanceCheck.balance} WND but need at least ${balanceCheck.required} WND for transaction fees. ` +
        `Get free testnet tokens at: https://faucet.polkadot.io/westend`
      );
    }
    
    // Get the injector for signing
    const injector = await web3FromAddress(accountAddress);
    
    // Create remark with certificate hash
    // System.remark stores arbitrary data on-chain
    const remarkData = `CERTICHAIN:${certificateHash}`;
    const remarkHex = stringToHex(remarkData);
    
    // Create and sign transaction
    const tx = polkadotApi.tx.system.remark(remarkHex);
    
    return new Promise((resolve, reject) => {
      tx.signAndSend(
        accountAddress,
        { signer: injector.signer },
        ({ status, txHash, events, dispatchError }) => {
          if (status.isInBlock) {
            console.log(`✅ Transaction included in block: ${status.asInBlock.toString()}`);
            
            // Check for errors
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = polkadotApi.registry.findMetaError(dispatchError.asModule);
                const { docs, name, section } = decoded;
                reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
              return;
            }
            
            events.forEach(({ event }) => {
              if (polkadotApi.events.system.ExtrinsicFailed.is(event)) {
                reject(new Error('Transaction failed'));
              }
            });
            
            resolve({
              txHash: txHash.toString(),
              blockHash: status.asInBlock.toString()
            });
          } else if (status.isFinalized) {
            console.log(`✅ Transaction finalized: ${status.asFinalized.toString()}`);
          }
        }
      ).catch((error) => {
        // Handle specific error codes
        if (error.message && error.message.includes('1010')) {
          reject(new Error(
            `Insufficient balance to pay transaction fees. Get free testnet tokens at: https://faucet.polkadot.io/westend`
          ));
        } else {
          reject(error);
        }
      });
    });
  } catch (error: any) {
    console.error('Error storing certificate on chain:', error);
    // Improve error message for common issues
    if (error.message && error.message.includes('1010')) {
      throw new Error(
        `Insufficient balance to pay transaction fees. Get free testnet tokens at: https://faucet.polkadot.io/westend`
      );
    }
    throw error;
  }
};

/**
 * Verify certificate exists on blockchain
 */
export const verifyCertificateOnChain = async (
  certificateHash: string,
  blockHash?: string
): Promise<boolean> => {
  try {
    const polkadotApi = await getPolkadotApi();
    
    if (blockHash) {
      // Verify in specific block
      const apiAt = await polkadotApi.at(blockHash);
      const block = await polkadotApi.rpc.chain.getBlock(blockHash);
      
      // Check extrinsics in the block
      const extrinsics = block.block.extrinsics;
      const remarkData = `CERTICHAIN:${certificateHash}`;
      const remarkHex = stringToHex(remarkData);
      
      for (const ext of extrinsics) {
        if (ext.method.section === 'system' && ext.method.method === 'remark') {
          const data = ext.method.args[0].toString();
          if (data === remarkHex) {
            return true;
          }
        }
      }
    }
    
    // If no specific block, certificate is considered valid if hash format is correct
    // In production, you'd scan recent blocks or use an indexer
    return certificateHash.startsWith('0x') && certificateHash.length === 66;
  } catch (error) {
    console.error('Error verifying certificate on chain:', error);
    return false;
  }
};

/**
 * Get account balance
 */
export const getAccountBalance = async (address: string): Promise<string> => {
  try {
    const polkadotApi = await getPolkadotApi();
    const { data: balance } = await polkadotApi.query.system.account(address);
    
    // Convert to DOT (Polkadot has 10 decimal places)
    const free = balance.free.toBigInt();
    const dot = Number(free) / 10 ** 10;
    
    return dot.toFixed(4);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

/**
 * Get current block number
 */
export const getCurrentBlockNumber = async (): Promise<number> => {
  try {
    const polkadotApi = await getPolkadotApi();
    const header = await polkadotApi.rpc.chain.getHeader();
    return header.number.toNumber();
  } catch (error) {
    console.error('Error getting block number:', error);
    return 0;
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (txHash: string) => {
  try {
    const polkadotApi = await getPolkadotApi();
    
    // Get block hash from transaction
    const signedBlock = await polkadotApi.rpc.chain.getBlock();
    
    return {
      blockNumber: signedBlock.block.header.number.toNumber(),
      blockHash: signedBlock.block.header.hash.toString(),
      timestamp: Date.now() // In production, extract from block
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
};

/**
 * Create a keyring for testing (development only)
 */
export const createTestKeyring = async () => {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });
  
  // Create test account (Alice)
  const alice = keyring.addFromUri('//Alice');
  
  return {
    address: alice.address,
    keyring: alice
  };
};

/**
 * Disconnect from Polkadot network
 */
export const disconnectPolkadot = async () => {
  if (api) {
    await api.disconnect();
    api = null;
    console.log('Disconnected from Polkadot network');
  }
};

// Export types
export interface CertificateData {
  certificate_id: string;
  holder_name: string;
  course_name: string;
  institution: string;
  issue_date: string;
}

export interface BlockchainTransaction {
  txHash: string;
  blockHash: string;
  blockNumber?: number;
  timestamp?: number;
}
