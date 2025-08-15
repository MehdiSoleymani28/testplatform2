import { Project } from '../project/project.model';

export class ApiEndpoint {
  id: number;
  method: string;
  url: string;
  group?: string;
  project?: Project;
}
