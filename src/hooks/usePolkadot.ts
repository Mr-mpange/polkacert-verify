import { useState, useEffect } from 'react';
import {
  initPolkadotApi,
  connectWallet,
  getAccountBalance,
  getCurrentBlockNumber,
  storeCertificateOnChain,
  verifyCertificateOnChain,
  generateCertificateHash,
  type CertificateData,
  type BlockchainTransaction
} from '@/lib/polkadot';
import { toast } from 'sonner';

interface PolkadotAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export const usePolkadot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState<PolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PolkadotAccount | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize Polkadot API on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initPolkadotApi();
        setIsConnected(true);
        
        // Get current block number
        const block = await getCurrentBlockNumber();
        setBlockNumber(block);
        
        // Update block number every 6 seconds (Polkadot block time)
        const interval = setInterval(async () => {
          const newBlock = await getCurrentBlockNumber();
          setBlockNumber(newBlock);
        }, 6000);
        
        // Auto-connect wallet if available
        try {
          const walletAccounts = await connectWallet();
          console.log('Auto-connect: Found accounts:', walletAccounts);
          if (walletAccounts.length > 0) {
            setAccounts(walletAccounts as PolkadotAccount[]);
            const account = walletAccounts[0] as PolkadotAccount;
            setSelectedAccount(account);
            console.log('Auto-connect: Selected account:', account);
            const bal = await getAccountBalance(account.address);
            setBalance(bal);
            console.log('Auto-connect: Balance:', bal);
          }
        } catch (err) {
          // Wallet not available or user denied, ignore
          console.log('Auto-connect failed:', err);
          console.log('Wallet auto-connect skipped');
        }
        
        return () => clearInterval(interval);
      } catch (err: any) {
        setError(err.message);
        setIsConnected(false);
      }
    };
    
    init();
  }, []);

  // Connect wallet
  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const walletAccounts = await connectWallet();
      setAccounts(walletAccounts as PolkadotAccount[]);
      
      if (walletAccounts.length > 0) {
        const account = walletAccounts[0] as PolkadotAccount;
        setSelectedAccount(account);
        
        // Get balance
        const bal = await getAccountBalance(account.address);
        setBalance(bal);
        
        toast.success('Wallet Connected', {
          description: `Connected to ${account.meta.name || account.address.slice(0, 8)}...`
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Connection Failed', {
        description: err.message
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Select different account
  const selectAccount = async (account: PolkadotAccount) => {
    setSelectedAccount(account);
    const bal = await getAccountBalance(account.address);
    setBalance(bal);
  };

  // Store certificate on blockchain
  const storeCertificate = async (
    certificateData: CertificateData
  ): Promise<BlockchainTransaction | null> => {
    if (!selectedAccount) {
      toast.error('No wallet connected');
      return null;
    }

    try {
      toast.info('Generating certificate hash...');
      const hash = await generateCertificateHash(certificateData);
      
      toast.info('Storing on Polkadot blockchain...', {
        description: 'Please sign the transaction in your wallet'
      });
      
      const result = await storeCertificateOnChain(hash, selectedAccount.address);
      
      toast.success('Certificate stored on blockchain!', {
        description: `Block: ${result.blockHash.slice(0, 10)}...`
      });
      
      return {
        ...result,
        blockNumber: blockNumber
      };
    } catch (err: any) {
      toast.error('Failed to store certificate', {
        description: err.message
      });
      return null;
    }
  };

  // Verify certificate on blockchain
  const verifyCertificate = async (
    certificateHash: string,
    blockHash?: string
  ): Promise<boolean> => {
    try {
      const isValid = await verifyCertificateOnChain(certificateHash, blockHash);
      return isValid;
    } catch (err: any) {
      console.error('Verification error:', err);
      return false;
    }
  };

  // Generate hash for certificate
  const generateHash = async (certificateData: CertificateData): Promise<string> => {
    return await generateCertificateHash(certificateData);
  };

  return {
    // State
    isConnected,
    isConnecting,
    accounts,
    selectedAccount,
    balance,
    blockNumber,
    error,
    
    // Actions
    connect,
    selectAccount,
    storeCertificate,
    verifyCertificate,
    generateHash
  };
};
