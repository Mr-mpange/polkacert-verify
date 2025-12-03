/**
 * Blockchain Verification Component
 * Displays detailed blockchain verification information using Subscan API
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Hash, 
  Box,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  useCertificateVerification, 
  useTransaction, 
  useBlock 
} from '@/hooks/useSubscan';
import {
  getTransactionUrl,
  getBlockUrl,
  getAccountUrl,
  formatBalance,
  formatTimestamp,
} from '@/lib/subscan';

interface BlockchainVerificationProps {
  certificateHash: string;
  txHash?: string;
  blockHash?: string;
}

export function BlockchainVerification({
  certificateHash,
  txHash,
  blockHash,
}: BlockchainVerificationProps) {
  const { verification, loading: verifying, error: verifyError, verify } = 
    useCertificateVerification(certificateHash, txHash || null);
  
  const { transaction, loading: txLoading } = useTransaction(txHash || null);
  const { block, loading: blockLoading } = useBlock(
    transaction?.block_num || blockHash || null
  );

  const [showDetails, setShowDetails] = useState(false);

  if (verifying || txLoading || blockLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Blockchain Verification
          </CardTitle>
          <CardDescription>Verifying certificate on Polkadot blockchain...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (verifyError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Verification Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{verifyError}</AlertDescription>
          </Alert>
          <Button 
            onClick={verify} 
            variant="outline" 
            className="mt-4"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isVerified = verification?.verified || false;
  const exists = verification?.exists || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isVerified ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          {isVerified 
            ? 'Certificate verified on Polkadot blockchain' 
            : 'Certificate verification status'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Status</span>
          <Badge variant={isVerified ? 'default' : 'destructive'}>
            {isVerified ? 'Verified ✓' : exists ? 'Pending' : 'Not Found'}
          </Badge>
        </div>

        {/* Certificate Hash */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Hash className="h-4 w-4" />
            Certificate Hash
          </div>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            {certificateHash}
          </code>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4" />
                Transaction Hash
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                  {transaction.extrinsic_hash}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getTransactionUrl(transaction.extrinsic_hash), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Block Information */}
            {block && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Box className="h-4 w-4" />
                  Block Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Block Number</div>
                    <div className="font-mono">#{block.block_num}</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Finalized</div>
                    <div>
                      {block.finalized ? (
                        <Badge variant="default" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded col-span-2">
                    <div className="text-xs text-muted-foreground">Timestamp</div>
                    <div className="font-mono text-xs">
                      {formatTimestamp(block.block_timestamp)}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getBlockUrl(block.block_num), '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Block on Subscan
                </Button>
              </div>
            )}

            {/* Transaction Details Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Transaction Details
            </Button>

            {showDetails && (
              <div className="space-y-3 p-3 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Module</div>
                    <Badge variant="outline">{transaction.call_module}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Function</div>
                    <Badge variant="outline">{transaction.call_module_function}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Success</div>
                    {transaction.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Fee</div>
                    <div className="font-mono text-xs">
                      {formatBalance(transaction.fee)} DOT
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Issuer Account
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded text-xs break-all">
                      {transaction.account_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getAccountUrl(transaction.account_id), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Parameters */}
                {transaction.params && transaction.params.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Parameters</div>
                    <div className="space-y-1">
                      {transaction.params.map((param, index) => (
                        <div key={index} className="p-2 bg-background rounded text-xs">
                          <div className="text-muted-foreground">{param.name} ({param.type})</div>
                          <code className="break-all">{JSON.stringify(param.value)}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* No Transaction Hash */}
        {!txHash && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No transaction hash available. The certificate may not be stored on the blockchain yet.
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Info */}
        <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Verified using Subscan API</span>
          </div>
          <div>
            All blockchain data is publicly verifiable and immutable.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
