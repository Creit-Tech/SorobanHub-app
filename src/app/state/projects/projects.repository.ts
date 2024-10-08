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
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { filter, Observable, of, switchMap, take } from 'rxjs';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { Widget } from '../widgets/widgets.repository';
import { StorageStrategy } from '../storage.strategy';

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
  widgets: Widget['_id'][];
}

export interface ProjectsProps {
  selectedProject?: Project['_id'];
}

const store = createStore(
  { name: 'projects' },
  withProps<ProjectsProps>({}),
  withEntities<Project, '_id'>({ idKey: '_id' }),
  withProjectViewsEntities<ProjectView, '_id'>({ idKey: '_id' }),
  withActiveId()
);

@Injectable({ providedIn: 'root' })
export class ProjectsRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

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

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: '@SorobanHub/projects',
        storage: new StorageStrategy({ password: this.lockScreenRepository.store.value.password! }),
      });
    });
  }

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
