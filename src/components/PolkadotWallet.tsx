import { useState } from "react";
import { usePolkadot } from "@/hooks/usePolkadot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export const PolkadotWallet = () => {
  const {
    isConnected,
    isConnecting,
    accounts,
    selectedAccount,
    balance,
    blockNumber,
    error,
    connect,
    selectAccount
  } = usePolkadot();
  
  const [open, setOpen] = useState(false);

  const handleConnect = async () => {
    await connect();
    if (accounts.length > 0) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {selectedAccount ? (
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden md:inline">
              {selectedAccount.meta.name || `${selectedAccount.address.slice(0, 6)}...${selectedAccount.address.slice(-4)}`}
            </span>
            <Badge variant="secondary" className="ml-2">
              {balance} WND
            </Badge>
          </Button>
        ) : (
          <Button variant="default" className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Polkadot Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your Polkadot.js extension to interact with the blockchain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Network Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network Status</span>
                  {isConnected ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Disconnected
                    </Badge>
                  )}
                </div>
                
                {isConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Block</span>
                    <span className="text-sm font-mono">#{blockNumber.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Connection Error</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connect Button or Account List */}
          {!selectedAccount ? (
            <div className="space-y-3">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect Polkadot.js Extension'}
              </Button>
              
              <div className="text-xs text-center text-muted-foreground">
                Don't have Polkadot.js extension?{' '}
                <a 
                  href="https://polkadot.js.org/extension/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Install here
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium">Connected Accounts</div>
              {accounts.map((account) => (
                <Card 
                  key={account.address}
                  className={`cursor-pointer transition-colors ${
                    selectedAccount.address === account.address 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => selectAccount(account)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {account.meta.name || 'Unnamed Account'}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {account.address.slice(0, 10)}...{account.address.slice(-8)}
                        </div>
                      </div>
                      {selectedAccount.address === account.address && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="pt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-mono">{balance} WND</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>Westend Testnet</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
