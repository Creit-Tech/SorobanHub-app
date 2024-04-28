import { Injectable } from '@angular/core';
import { deleteEntitiesByPredicate, getActiveEntity } from '@ngneat/elf-entities';
import { emitOnce } from '@ngneat/elf';
import { Widget, WidgetsRepository } from '../../../state/widgets/widgets.repository';
import { Project, ProjectsRepository } from '../../../state/projects/projects.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditProjectComponent } from '../../../shared/modals/edit-project/edit-project.component';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly matDialog: MatDialog
  ) {}

  editProject(project: Project): void {
    this.matDialog.open(EditProjectComponent, {
      hasBackdrop: true,
      data: { project },
    });
  }

  editActiveProject(): void {
    const activeProject = this.projectsRepository.store.query(getActiveEntity());
    if (!activeProject) {
      // TODO: toast this
      return;
    }

    this.editProject(activeProject);
  }

  removeProject(project: Project): void {
    if (confirm(`Confirm that you want to remove the project "${project.name}"`)) {
      emitOnce(() => {
        this.widgetsRepository.store.update(
          deleteEntitiesByPredicate((entity: Widget): boolean => entity.project === project._id)
        );
        this.projectsRepository.removeProject(project._id);
      });

      this.matSnackBar.open(`Project "${project.name} and all its views have been removed"`, 'close', {
        duration: 5000,
      });
    }
  }

  removeActiveProject(): void {
    const activeProject = this.projectsRepository.store.query(getActiveEntity());
    if (!activeProject) {
      // TODO: toast this
      return;
    }

    this.removeProject(activeProject);
  }
}
