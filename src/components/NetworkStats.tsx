/**
 * Network Statistics Component
 * Displays Polkadot network statistics from Subscan
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Box, 
  Users, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { useNetworkStats } from '@/hooks/useSubscan';
import { formatBalance } from '@/lib/subscan';

interface NetworkStatsProps {
  refreshInterval?: number; // in milliseconds
}

export function NetworkStats({ refreshInterval = 30000 }: NetworkStatsProps) {
  const { stats, loading, error } = useNetworkStats(refreshInterval);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
          <CardDescription>Loading network data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Network Statistics
        </CardTitle>
        <CardDescription>
          Real-time Polkadot network metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latest Block */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Box className="h-4 w-4" />
              Latest Block
            </div>
            <div className="text-2xl font-bold">
              #{stats.block_num.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-xs">
              Finalized: #{stats.finalized_block_num.toLocaleString()}
            </Badge>
          </div>

          {/* Block Time */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Block Time
            </div>
            <div className="text-2xl font-bold">
              {stats.block_time}s
            </div>
            <div className="text-xs text-muted-foreground">
              Average time per block
            </div>
          </div>

          {/* Validators */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Validators
            </div>
            <div className="text-2xl font-bold">
              {stats.validator_count.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Active validators
            </div>
          </div>

          {/* Nominators */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Nominators
            </div>
            <div className="text-2xl font-bold">
              {stats.nominator_count.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Active nominators
            </div>
          </div>

          {/* Total Issuance */}
          <div className="p-4 bg-muted rounded-lg space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Total Issuance
            </div>
            <div className="text-2xl font-bold">
              {formatBalance(stats.total_issuance, 10)} DOT
            </div>
            <div className="text-xs text-muted-foreground">
              Total supply in circulation
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          Auto-refreshes every {refreshInterval / 1000} seconds
        </div>
      </CardContent>
    </Card>
  );
}
