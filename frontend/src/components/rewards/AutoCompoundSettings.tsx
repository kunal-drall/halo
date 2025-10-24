'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutoCompoundSettingsProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function AutoCompoundSettings({ isEnabled, onToggle }: AutoCompoundSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Compound Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-500" />
            <div>
              <h4 className="font-medium">Auto-Compound Rewards</h4>
              <p className="text-sm text-gray-500">
                Automatically restake your rewards to maximize returns
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onToggle}
            className={isEnabled ? 'bg-green-50 border-green-200' : ''}
          >
            {isEnabled ? (
              <ToggleRight className="h-5 w-5 text-green-600" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
        
        {isEnabled && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Auto-Compound Active</h4>
            <p className="text-sm text-green-700">
              Your rewards will be automatically restaked to maximize your returns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
