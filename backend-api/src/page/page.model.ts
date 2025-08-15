import { Project } from '../project/project.model';

export class Page {
  id: number;
  url: string;
  requirements?: string;
  project?: Project;
}
