import { Injectable } from '@angular/core';
import { IdentitiesRepository, Identity } from '../../../state/identities/identities.repository';
import { deleteEntities, getEntitiesCountByPredicate, getEntity, getEntityByPredicate } from '@ngneat/elf-entities';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project, ProjectsRepository } from '../../../state/projects/projects.repository';

@Injectable({
  providedIn: 'root',
})
export class IdentitiesService {
  constructor(
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly projectsRepository: ProjectsRepository
  ) {}

  /**
   * This function assumes the user is sure it wants to delete the identity.
   * If an identity is being used in a project or a widget it can not be deleted.
   * After deletion, it will show an snackbar with the notification.
   * TODO: Add widget validation before deleting the identity
   */
  deleteIdentity(identityId: Identity['_id']): void {
    const identity: Identity | undefined = this.identitiesRepository.store.query(getEntity(identityId));

    if (!identity) {
      throw new Error(`Identity ${identityId} doesn't exist`);
    }

    const totalProjects: number = this.projectsRepository.store.query(
      getEntitiesCountByPredicate((entity: Project): boolean => entity.defaultIdentityId === identityId)
    );

    if (totalProjects > 0) {
      const msg: string = `Identity can not be deleted because is being used in ${totalProjects} project(s).`;
      this.matSnackBar.open(msg, 'close', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      throw new Error(msg);
    }

    this.identitiesRepository.store.update(deleteEntities([identity._id]));

    this.matSnackBar.open(`Identity "${identity.name} deleted."`, 'close', {
      duration: 5000,
    });
  }
}
