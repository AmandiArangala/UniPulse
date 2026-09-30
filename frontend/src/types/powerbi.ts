export interface DAXMeasure {
  measureKey: string;
  name: string;
  daxFormula: string;
  calculatedValue: number;
  unit: string;
  category: 'Academic Performance' | 'Behavioral Engagement' | 'Risk Analytics' | 'Statistical Modeling' | 'Composite Index';
  description: string;
  sqlEquivalent: string;
  varianceFromTarget: number;
  statusIndicator: 'SATISFACTORY' | 'ATTENTION_REQUIRED' | 'CRITICAL';
}

export interface StarSchemaRelationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'ONE_TO_ONE';
  filterDirection: 'SINGLE_DIRECTIONAL' | 'BOTH_DIRECTIONS';
  isActive: boolean;
  description: string;
}

export interface PowerBISemanticModel {
  modelName: string;
  targetWarehouse: string;
  databaseSchema: string;
  totalFactRecords: number;
  daxMeasures: DAXMeasure[];
  relationships: StarSchemaRelationship[];
  dimensionTables: string[];
  factTable: string;
  lastRefreshedAt: string;
}

export interface PowerBIFilterState {
  semester: string;
  faculty: string;
  department: string;
  riskStatus: string;
}
