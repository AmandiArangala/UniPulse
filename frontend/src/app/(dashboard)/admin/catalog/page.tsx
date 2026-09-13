import React from 'react';
import { Metadata } from 'next';
import { AcademicCatalogTabs } from '@/components/admin/AcademicCatalogTabs';

export const metadata: Metadata = {
  title: 'Academic Catalog Manager | UniPulse Admin',
  description: 'Manage institution faculties, departments, degree programs, and academic terms.',
};

export default function AdminCatalogPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AcademicCatalogTabs />
    </div>
  );
}
