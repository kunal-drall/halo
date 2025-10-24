'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/staking';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onTransactionsUpdate: (transactions: Transaction[]) => void;
}

export function TransactionHistory({ transactions, onTransactionsUpdate }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions yet</p>
        </div>
      </CardContent>
    </Card>
  );
}
