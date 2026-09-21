'use client';

import React from 'react';
import { WhatIfGradeSimulator } from '@/components/student/WhatIfGradeSimulator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function StudentSimulatorPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <WhatIfGradeSimulator />
    </div>
  );
}
