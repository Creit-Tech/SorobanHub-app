import { createStore, propsFactory, withProps } from '@ngneat/elf';
import {
  withEntities,
  selectAllEntities,
  withActiveId,
  selectActiveEntity,
  entitiesPropsFactory,
  selectAllEntitiesApply,
  deleteEntities,
  deleteEntitiesByPredicate,
} from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';
import { Observable, of, switchMap } from 'rxjs';

export interface Project {
  _id: string;
  img?: string;
  name: string;
  networkId: string;
  defaultIdentityId: string;
}

export const { projectViewsEntitiesRef, withProjectViewsEntities } = entitiesPropsFactory('projectViews');

export interface ProjectView {
  _id: string;
  projectId: Project['_id'];
  name: string;
}

export interface ProjectsProps {}

const store = createStore(
  { name: 'projects' },
  withProps<ProjectsProps>({}),
  withEntities<Project, '_id'>({ idKey: '_id' }),
  withProjectViewsEntities<ProjectView, '_id'>({ idKey: '_id' }),
  withActiveId()
);

const persist = persistState(store, {
  key: 'projects',
  storage: new StorageStrategy({ encrypt: true }),
});

@Injectable({ providedIn: 'root' })
export class ProjectsRepository {
  store = store;
  persist = persist;

  projects$: Observable<Project[]> = store.pipe(selectAllEntities());
  activeProject$: Observable<Project | undefined> = store.pipe(selectActiveEntity());

  activeProjectViews$: Observable<ProjectView[]> = this.activeProject$.pipe(
    switchMap((activeProject: Project | undefined): Observable<ProjectView[]> => {
      if (!activeProject) {
        return of([]);
      }

      return store.pipe(
        selectAllEntitiesApply({
          filterEntity: (entity: ProjectView): boolean => entity.projectId === activeProject._id,
          ref: projectViewsEntitiesRef,
        })
      );
    })
  );

  removeProject(projectId: Project['_id']): void {
    this.store.update(
      deleteEntitiesByPredicate((projectView: ProjectView): boolean => projectView.projectId === projectId, {
        ref: projectViewsEntitiesRef,
      }),
      deleteEntities([projectId])
    );
  }

  removeView(projectViewId: ProjectView['_id']): void {
    this.store.update(deleteEntities([projectViewId], { ref: projectViewsEntitiesRef }));
  }
}
