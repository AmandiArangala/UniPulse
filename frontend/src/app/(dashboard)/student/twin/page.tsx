'use client';

import React from 'react';
import { AcademicProgressTwin } from '@/components/student/AcademicProgressTwin';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function StudentTwinPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <AcademicProgressTwin
        studentName="Alex Mercer"
        studentId="STU-2026-8941"
        programName="BSc Computer Science & Data Analytics"
      />
    </div>
  );
}
