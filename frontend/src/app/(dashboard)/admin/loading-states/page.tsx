/**
 * Loading States Test Page - Demonstrates all loading components and patterns
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  ProgressiveLoader, 
  RetryLoader,
  PulseLoader,
  ShimmerLoader,
  DelayedLoader,
  LoadingButton,
  ContentPlaceholder 
} from '@/components/loading/LoadingStates';
import {
  ContentSkeleton,
  TableSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ListSkeleton,
  ChartSkeleton,
  SearchSkeleton,
  ProfileSkeleton,
  PageSkeleton
} from '@/components/loading/LoadingSkeletons';
import { useLoading, useMultipleLoading, useDebouncedLoading } from '@/lib/hooks/useLoading';
import { useToast } from '@/lib/toast';

const LoadingStatesTestPage: React.FC = () => {
  const { toast } = useToast();
  
  // Basic loading states
  const [showOverlay, setShowOverlay] = useState(false);
  const [showProgressive, setShowProgressive] = useState(false);
  const [retryError, setRetryError] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  // Advanced loading hooks
  const mainLoading = useLoading({
    onSuccess: (data) => toast({ title: 'Success!', description: 'Operation completed' }),
    onError: (error) => toast({ title: 'Error', description: error, variant: 'destructive' })
  });

  const multiLoading = useMultipleLoading(['save', 'delete', 'export', 'sync']);
  const debouncedLoading = useDebouncedLoading(500);

  // Demo functions
  const simulateApiCall = (duration = 2000, shouldFail = false): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Simulated API error occurred'));
        } else {
          resolve({ message: 'Data loaded successfully', timestamp: Date.now() });
        }
      }, duration);
    });
  };

  const handleProgressiveLoad = () => {
    setShowProgressive(true);
    setTimeout(() => setShowProgressive(false), 8000);
  };

  const handleRetryDemo = () => {
    setRetryError('Connection failed. Please check your network.');
  };

  const handleButtonDemo = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 3000);
  };

  const handleAsyncOperation = () => {
    mainLoading.execute(() => simulateApiCall(3000), {
      loadingText: 'Processing your request...',
      progressStages: [
        'Validating data',
        'Connecting to server',
        'Processing request',
        'Finalizing'
      ]
    });
  };

  const handleMultipleOperations = (operation: string) => {
    multiLoading.setLoading(operation, true);
    setTimeout(() => {
      multiLoading.setLoading(operation, false);
      toast({ title: 'Complete', description: `${operation} operation finished` });
    }, 2000);
  };

  const handleDebouncedDemo = () => {
    debouncedLoading.setLoading(true);
    setTimeout(() => debouncedLoading.setLoading(false), 100);
  };

  const progressiveStages = [
    { name: 'Initializing system', duration: 1500 },
    { name: 'Loading user data', duration: 1000 },
    { name: 'Fetching configurations', duration: 800 },
    { name: 'Preparing interface', duration: 1200 },
    { name: 'Finalizing setup', duration: 1000 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loading States & Skeletons</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive demonstration of loading components, skeletons, and state management.
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Loading</TabsTrigger>
          <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          <TabsTrigger value="advanced">Advanced States</TabsTrigger>
          <TabsTrigger value="hooks">Loading Hooks</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Spinners */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Spinners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Small</p>
                    <LoadingSpinner size="sm" text="Loading..." />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Medium</p>
                    <LoadingSpinner size="md" text="Processing..." />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Large with Progress</p>
                    <LoadingSpinner size="lg" text="Uploading files" showProgress progress={65} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pulse Loaders */}
            <Card>
              <CardHeader>
                <CardTitle>Pulse Animations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Small Pulse</p>
                  <PulseLoader size="sm" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Medium Pulse</p>
                  <PulseLoader size="md" count={4} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Large Pulse</p>
                  <PulseLoader size="lg" count={5} />
                </div>
              </CardContent>
            </Card>

            {/* Loading Overlay */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Overlay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowOverlay(true)}>
                  Show Overlay
                </Button>
                <LoadingOverlay isLoading={showOverlay} text="Processing...">
                  <div className="p-4 bg-gray-100 rounded">
                    <p>This content will be blurred when loading.</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                </LoadingOverlay>
                {showOverlay && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowOverlay(false)}
                  >
                    Hide Overlay
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Progressive Loader */}
            <Card>
              <CardHeader>
                <CardTitle>Progressive Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleProgressiveLoad}>
                  Start Progressive Load
                </Button>
                {showProgressive && (
                  <ProgressiveLoader 
                    stages={progressiveStages}
                    onComplete={() => {
                      setShowProgressive(false);
                      toast({ title: 'Complete!', description: 'Progressive loading finished' });
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Retry Loader */}
            <Card>
              <CardHeader>
                <CardTitle>Retry Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleRetryDemo}>
                  Simulate Error
                </Button>
                <RetryLoader
                  isLoading={false}
                  error={retryError}
                  onRetry={() => setRetryError('')}
                />
              </CardContent>
            </Card>

            {/* Loading Button */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <LoadingButton 
                    loading={buttonLoading}
                    loadingText="Saving..."
                    onClick={handleButtonDemo}
                  >
                    Save Changes
                  </LoadingButton>
                  <LoadingButton 
                    loading={buttonLoading}
                    variant="destructive"
                    loadingText="Deleting..."
                  >
                    Delete Item
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skeletons" className="space-y-6">
          <div className="grid gap-6">
            {/* Content Skeletons */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContentSkeleton lines={4} showAvatar={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>List Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <ListSkeleton items={4} />
                </CardContent>
              </Card>
            </div>

            {/* Table Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Table Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <TableSkeleton rows={6} columns={5} />
              </CardContent>
            </Card>

            {/* Form and Chart Skeletons */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormSkeleton fields={4} />
              <ChartSkeleton type="bar" />
            </div>

            {/* Dashboard and Profile Skeletons */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <SearchSkeleton results={3} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6">
            {/* Content Placeholders */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-0">
                  <ContentPlaceholder
                    type="loading"
                    title="Loading Data"
                    description="Please wait while we fetch your information..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <ContentPlaceholder
                    type="error"
                    title="Something Went Wrong"
                    description="We encountered an error while loading your data."
                    action={{
                      label: "Try Again",
                      onClick: () => toast({ title: "Retrying...", description: "Attempting to reload data" })
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <ContentPlaceholder
                    type="empty"
                    title="No Data Available"
                    description="There are no items to display at this time."
                    action={{
                      label: "Add New Item",
                      onClick: () => toast({ title: "Add Item", description: "Opening add item dialog" })
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Shimmer Effects */}
            <Card>
              <CardHeader>
                <CardTitle>Shimmer Loading Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">With Avatar</p>
                  <ShimmerLoader avatar={true} lines={3} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Text Only</p>
                  <ShimmerLoader avatar={false} lines={4} />
                </div>
              </CardContent>
            </Card>

            {/* Delayed Loading */}
            <Card>
              <CardHeader>
                <CardTitle>Delayed Loading Message</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>
                  Refresh to See Delayed Loading
                </Button>
                <DelayedLoader delay={1000}>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      This message appears after a 1-second delay to avoid flash of loading content.
                    </p>
                  </div>
                </DelayedLoader>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-6">
          <div className="grid gap-6">
            {/* Main Loading Hook Demo */}
            <Card>
              <CardHeader>
                <CardTitle>useLoading Hook Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleAsyncOperation}>
                    Start Async Operation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={mainLoading.reset}
                  >
                    Reset State
                  </Button>
                </div>

                {mainLoading.isLoading && (
                  <div className="p-4 border rounded-lg">
                    <LoadingSpinner 
                      size="sm" 
                      text={mainLoading.stage || 'Loading...'} 
                      showProgress={mainLoading.progress !== undefined}
                      progress={mainLoading.progress || 0}
                    />
                  </div>
                )}

                {mainLoading.error && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-red-800">{mainLoading.error}</p>
                  </div>
                )}

                {mainLoading.data && (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <p className="text-green-800">Success: {mainLoading.data.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multiple Loading States */}
            <Card>
              <CardHeader>
                <CardTitle>Multiple Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['save', 'delete', 'export', 'sync'].map((operation) => (
                    <LoadingButton
                      key={operation}
                      loading={multiLoading.isLoading(operation)}
                      onClick={() => handleMultipleOperations(operation)}
                      className="capitalize"
                    >
                      {operation}
                    </LoadingButton>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  <p>Any loading: {multiLoading.isAnyLoading ? 'Yes' : 'No'}</p>
                  <p>All loading: {multiLoading.areAllLoading ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Debounced Loading */}
            <Card>
              <CardHeader>
                <CardTitle>Debounced Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleDebouncedDemo}>
                    Quick Toggle (Debounced)
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      debouncedLoading.setLoading(true);
                      setTimeout(() => debouncedLoading.setLoading(false), 2000);
                    }}
                  >
                    Slow Toggle
                  </Button>
                </div>

                {debouncedLoading.isLoading && (
                  <div className="p-4 border rounded-lg">
                    <LoadingSpinner size="sm" text="Debounced loading state..." />
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Debounced loading prevents flickering on quick state changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingStatesTestPage;