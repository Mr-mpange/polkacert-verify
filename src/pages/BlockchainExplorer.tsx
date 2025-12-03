/**
 * Blockchain Explorer Page
 * Example page demonstrating Subscan integration
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockchainVerification } from '@/components/BlockchainVerification';
import { AccountTransactionHistory } from '@/components/AccountTransactionHistory';
import { NetworkStats } from '@/components/NetworkStats';
import { Search, Activity } from 'lucide-react';

export default function BlockchainExplorer() {
  const [txHash, setTxHash] = useState('');
  const [certificateHash, setCertificateHash] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  
  const [searchTxHash, setSearchTxHash] = useState('');
  const [searchCertHash, setSearchCertHash] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  const handleVerifyCertificate = () => {
    setSearchCertHash(certificateHash);
    setSearchTxHash(txHash);
  };

  const handleSearchAccount = () => {
    setSearchAddress(accountAddress);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Blockchain Explorer
        </h1>
        <p className="text-muted-foreground">
          Explore Polkadot blockchain data using Subscan API
        </p>
      </div>

      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network">Network Stats</TabsTrigger>
          <TabsTrigger value="certificate">Certificate Verification</TabsTrigger>
          <TabsTrigger value="account">Account History</TabsTrigger>
        </TabsList>

        {/* Network Statistics Tab */}
        <TabsContent value="network" className="space-y-6">
          <NetworkStats refreshInterval={30000} />
          
          <Card>
            <CardHeader>
              <CardTitle>About Network Statistics</CardTitle>
              <CardDescription>
                Real-time metrics from the Polkadot blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                The network statistics are fetched from Subscan API and updated every 30 seconds.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Latest block shows the most recent block number</li>
                <li>Block time indicates average time between blocks</li>
                <li>Validators are nodes securing the network</li>
                <li>Nominators are token holders staking with validators</li>
                <li>Total issuance shows all tokens in circulation</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificate Verification Tab */}
        <TabsContent value="certificate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify Certificate on Blockchain</CardTitle>
              <CardDescription>
                Enter certificate hash and transaction hash to verify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Certificate Hash</label>
                <Input
                  placeholder="0x1234...abcd"
                  value={certificateHash}
                  onChange={(e) => setCertificateHash(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Hash (Optional)</label>
                <Input
                  placeholder="0x5678...efgh"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleVerifyCertificate}
                disabled={!certificateHash}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Verify Certificate
              </Button>
            </CardContent>
          </Card>

          {searchCertHash && (
            <BlockchainVerification
              certificateHash={searchCertHash}
              txHash={searchTxHash || undefined}
            />
          )}

          {!searchCertHash && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Enter a certificate hash above to verify it on the blockchain
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account History Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Account Transactions</CardTitle>
              <CardDescription>
                Enter a Polkadot address to view transaction history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Address</label>
                <Input
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  value={accountAddress}
                  onChange={(e) => setAccountAddress(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearchAccount}
                disabled={!accountAddress}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Transactions
              </Button>
            </CardContent>
          </Card>

          {searchAddress && (
            <AccountTransactionHistory
              address={searchAddress}
              pageSize={10}
            />
          )}

          {!searchAddress && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Enter an account address above to view its transaction history
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Subscan Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            This blockchain explorer uses <strong>Subscan API</strong> to fetch real-time data 
            from the Polkadot blockchain. Subscan is a high-precision blockchain explorer that 
            provides comprehensive blockchain data access.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Features:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Real-time network statistics</li>
              <li>Transaction verification and details</li>
              <li>Account transaction history</li>
              <li>Block information and finalization status</li>
              <li>Certificate hash verification on-chain</li>
              <li>Direct links to Subscan explorer</li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            All data is fetched from the public Subscan API. For production use with higher 
            rate limits, consider getting an API key from{' '}
            <a 
              href="https://support.subscan.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Subscan Support
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
