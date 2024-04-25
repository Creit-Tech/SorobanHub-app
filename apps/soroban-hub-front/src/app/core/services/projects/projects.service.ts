import { Injectable } from '@angular/core';
import { deleteEntitiesByPredicate, getActiveEntity } from '@ngneat/elf-entities';
import { emitOnce } from '@ngneat/elf';
import { Widget, WidgetsRepository } from '../../../state/widgets/widgets.repository';
import { ProjectsRepository } from '../../../state/projects/projects.repository';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly matSnackBar: MatSnackBar
  ) {}

  removeActiveProject() {
    const activeProject = this.projectsRepository.store.query(getActiveEntity());
    if (!activeProject) {
      // TODO: toast this
      return;
    }

    if (confirm(`Confirm that you want to remove the project "${activeProject.name}"`)) {
      emitOnce(() => {
        this.widgetsRepository.store.update(
          deleteEntitiesByPredicate((entity: Widget): boolean => entity.project === activeProject._id)
        );
        this.projectsRepository.removeProject(activeProject._id);
      });

      this.matSnackBar.open(`Project "${activeProject.name} and all its views have been removed"`, 'close', {
        duration: 5000,
      });
    }
  }
}
