export class Project {
  id: number;
  name: string;
  baseUrl: string;
  createdAt: Date;
  pages?: any[];
  tests?: any[];
  apiEndpoints?: any[];
}
