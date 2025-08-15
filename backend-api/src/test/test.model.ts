import { Project } from '../project/project.model';

export class Test {
  id: number;
  framework: string;
  script: string;
  status: string;
  project?: Project;
}
