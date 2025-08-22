import { Project } from '../project/project.model';

export class Test {
  id: number;
  name: string;
  description: string;
  status: string;
  framework?: string;
  script?: string;
  project?: Project;
}
