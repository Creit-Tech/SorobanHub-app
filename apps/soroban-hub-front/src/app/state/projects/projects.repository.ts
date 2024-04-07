import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';

export interface Project {
  _id: string;
  name: string;
  networkId: string;
  defaultSourcePub: string;
}

export interface ProjectsProps {
  savingProject: boolean;
}

const store = createStore(
  { name: 'projects' },
  withProps<ProjectsProps>({
    savingProject: true,
  }),
  withEntities<Project, '_id'>({ idKey: '_id' })
);

@Injectable({ providedIn: 'root' })
export class ProjectsRepository {
  projects$ = store.pipe(selectAllEntities());
}
