import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project, ProjectsRepository } from '../../../state/projects/projects.repository';
import { Network, NetworksRepository } from '../../../state/networks/networks.repository';
import { deleteEntities, getEntitiesCountByPredicate, getEntity } from '@ngneat/elf-entities';

@Injectable({
  providedIn: 'root',
})
export class NetworksService {
  constructor(
    private readonly matSnackBar: MatSnackBar,
    private readonly projectsRepository: ProjectsRepository,
    private readonly networksRepository: NetworksRepository
  ) {}

  /**
   * This function assumes the user is sure it wants to delete the network.
   * If a network is being used in a project or a widget it can not be deleted.
   * After deletion, it will show an snackbar with the notification.
   * TODO: Add widget validation before deleting the identity
   */
  deleteNetwork(networkId: Network['_id']): void {
    const network: Network | undefined = this.networksRepository.store.query(getEntity(networkId));

    if (!network) {
      throw new Error(`Network ${networkId} doesn't exist`);
    }

    const totalProjects: number = this.projectsRepository.store.query(
      getEntitiesCountByPredicate((entity: Project): boolean => entity.networkId === networkId)
    );

    if (totalProjects > 0) {
      const msg: string = `Network can not be deleted because is being used in ${totalProjects} project(s).`;
      this.matSnackBar.open(msg, 'close', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      throw new Error(msg);
    }

    this.networksRepository.store.update(deleteEntities([network._id]));

    this.matSnackBar.open(`Network "${network.name} deleted."`, 'close', {
      duration: 5000,
    });
  }
}
