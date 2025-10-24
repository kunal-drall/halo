'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { solanaClient } from '@/lib/solana-client';

interface ProgramStatus {
  exists: boolean;
  hasIdl: boolean;
  error?: string;
}

export function ProgramStatusChecker() {
  const [status, setStatus] = useState<ProgramStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const programStatus = await solanaClient.checkProgramStatus();
      setStatus(programStatus);
    } catch (error) {
      setStatus({
        exists: false,
        hasIdl: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span>Checking program status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Program Status</span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          {status.exists ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-medium">Program Deployed</span>
          <Badge variant={status.exists ? 'default' : 'destructive'}>
            {status.exists ? 'Yes' : 'No'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {status.hasIdl ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-medium">IDL Initialized</span>
          <Badge variant={status.hasIdl ? 'default' : 'secondary'}>
            {status.hasIdl ? 'Yes' : 'No'}
          </Badge>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{status.error}</p>
              </div>
            </div>
          </div>
        )}

        {!status.exists && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Program Not Deployed</p>
                <p className="text-sm text-yellow-600">
                  The Halo Protocol program needs to be deployed to the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.exists && !status.hasIdl && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">IDL Not Initialized</p>
                <p className="text-sm text-blue-600">
                  The program is deployed but the IDL (Interface Definition Language) is not initialized.
                  This is required for the frontend to interact with the program.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.exists && status.hasIdl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">All Systems Ready</p>
                <p className="text-sm text-green-600">
                  The Halo Protocol program is fully deployed and ready to use.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Program ID: {process.env.NEXT_PUBLIC_PROGRAM_ID || '9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR'}
          </p>
          <p className="text-xs text-gray-500">
            Network: {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
