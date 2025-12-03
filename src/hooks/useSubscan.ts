/**
 * React hook for Subscan API integration
 * Provides easy access to blockchain explorer data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getTransactionDetails,
  getBlockInfo,
  getAccountInfo,
  getAccountTransactions,
  verifyCertificateHashOnChain,
  getNetworkStats,
  checkSubscanHealth,
  type TransactionDetails,
  type BlockInfo,
  type AccountInfo,
  type AccountTransaction,
  type NetworkStats,
  type Network,
  configureSubscan,
} from '@/lib/subscan';

/**
 * Hook for fetching transaction details
 */
export function useTransaction(txHash: string | null) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txHash) {
      setTransaction(null);
      return;
    }

    setLoading(true);
    setError(null);

    getTransactionDetails(txHash)
      .then(setTransaction)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [txHash]);

  return { transaction, loading, error };
}

/**
 * Hook for fetching block information
 */
export function useBlock(blockIdentifier: number | string | null) {
  const [block, setBlock] = useState<BlockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blockIdentifier) {
      setBlock(null);
      return;
    }

    setLoading(true);
    setError(null);

    getBlockInfo(blockIdentifier)
      .then(setBlock)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [blockIdentifier]);

  return { block, loading, error };
}

/**
 * Hook for fetching account information
 */
export function useAccount(address: string | null) {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!address) return;

    setLoading(true);
    setError(null);

    getAccountInfo(address)
      .then(setAccount)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { account, loading, error, refresh };
}

/**
 * Hook for fetching account transaction history
 */
export function useAccountTransactions(
  address: string | null,
  page: number = 0,
  pageSize: number = 20
) {
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!address) return;

    setLoading(true);
    setError(null);

    getAccountTransactions(address, page, pageSize)
      .then((data) => {
        setTransactions(data.extrinsics);
        setTotalCount(data.count);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address, page, pageSize]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, totalCount, loading, error, refresh };
}

/**
 * Hook for verifying certificate on blockchain
 */
export function useCertificateVerification(
  certificateHash: string | null,
  txHash: string | null
) {
  const [verification, setVerification] = useState<{
    exists: boolean;
    transaction?: TransactionDetails;
    block?: BlockInfo;
    verified: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(() => {
    if (!certificateHash) return;

    setLoading(true);
    setError(null);

    verifyCertificateHashOnChain(certificateHash, txHash || undefined)
      .then(setVerification)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [certificateHash, txHash]);

  useEffect(() => {
    verify();
  }, [verify]);

  return { verification, loading, error, verify };
}

/**
 * Hook for network statistics
 */
export function useNetworkStats(refreshInterval?: number) {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    getNetworkStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();

    if (refreshInterval) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return { stats, loading, error, refresh };
}

/**
 * Hook for Subscan health check
 */
export function useSubscanHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    const healthy = await checkSubscanHealth();
    setIsHealthy(healthy);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { isHealthy, checking, check };
}

/**
 * Hook for managing Subscan network configuration
 */
export function useSubscanNetwork() {
  const [network, setNetwork] = useState<Network>('westend');

  const changeNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
    configureSubscan({ network: newNetwork });
  }, []);

  return { network, changeNetwork };
}
