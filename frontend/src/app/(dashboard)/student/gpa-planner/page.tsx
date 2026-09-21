'use client';

import React from 'react';
import { GpaGoalPlanner } from '@/components/student/GpaGoalPlanner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function StudentGpaPlannerPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <GpaGoalPlanner />
    </div>
  );
}
