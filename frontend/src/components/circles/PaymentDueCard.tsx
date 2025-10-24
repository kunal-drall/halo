'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentDue } from '@/types/circles';
import { AlertCircle, Clock, DollarSign } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { circleService } from '@/services/circle-service';
import { useToast } from '@/components/ui/use-toast';

interface PaymentDueCardProps {
  payment: PaymentDue;
}

export function PaymentDueCard({ payment }: PaymentDueCardProps) {
  const { publicKey } = useWallet();
  const { addToast } = useToast();
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!publicKey) return;

    setIsPaying(true);
    try {
      const signature = await circleService.contribute(
        { circleId: payment.circleId, amount: payment.amount },
        publicKey
      );

      addToast({
        type: 'success',
        title: 'Payment Successful',
        description: `Contributed $${payment.amount} to ${payment.circleName}`,
        duration: 5000
      });

      // Refresh data or update state
      window.location.reload();
    } catch (error) {
      console.error('Error making payment:', error);
      addToast({
        type: 'error',
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        duration: 7000
      });
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusColor = () => {
    if (payment.isOverdue) return 'bg-red-100 text-red-800';
    if (payment.daysUntilDue <= 1) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = () => {
    if (payment.isOverdue) return 'Overdue';
    if (payment.daysUntilDue === 0) return 'Due Today';
    if (payment.daysUntilDue === 1) return 'Due Tomorrow';
    return `${payment.daysUntilDue} days left`;
  };

  return (
    <Card className={`border-l-4 ${payment.isOverdue ? 'border-l-red-500' : 'border-l-orange-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-900">{payment.circleName}</h3>
              <p className="text-sm text-gray-500">Monthly Contribution</p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-900">
                ${payment.amount}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {new Date(payment.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePay}
          disabled={isPaying}
          className="w-full h-12 text-lg font-semibold"
        >
          {isPaying ? 'Processing...' : `Pay $${payment.amount}`}
        </Button>
      </CardContent>
    </Card>
  );
}
