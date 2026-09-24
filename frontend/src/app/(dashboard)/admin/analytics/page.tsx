'use client';

import React from 'react';
import { AnalyticsOlapDashboard } from '@/components/admin/AnalyticsOlapDashboard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <AnalyticsOlapDashboard />
    </div>
  );
}
