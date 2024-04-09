import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddNewProjectComponent } from '../../shared/modals/add-new-project/add-new-project.component';
import { Project, ProjectsRepository, ProjectView } from '../../state/projects/projects.repository';
import { firstValueFrom, Observable } from 'rxjs';
import { getActiveEntity, setActiveId } from '@ngneat/elf-entities';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { AddNewProjectViewComponent } from '../../shared/modals/add-new-project-view/add-new-project-view.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        @apply block grid h-screen w-screen;
        grid-template-rows: auto 1fr;
      }
    `,
  ],
})
export class DashboardComponent {
  @ViewChild('projectAddList', { static: true }) projectAddListTemplate!: TemplateRef<any>;
  projectAddListRef?: MatBottomSheetRef;

  projects$: Observable<Project[]> = this.projectsRepository.projects$;
  activeProject$: Observable<Project | undefined> = this.projectsRepository.activeProject$;
  activeProjectViews$: Observable<ProjectView[]> = this.projectsRepository.activeProjectViews$;

  activeProjectViewTab: number = 0;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly projectsRepository: ProjectsRepository,
    private readonly bottomSheet: MatBottomSheet,
    private readonly matSnackBar: MatSnackBar
  ) {}

  onProjectSelected(project: Project) {
    this.projectsRepository.store.update(setActiveId(project._id));
  }

  async openAddNewList(): Promise<void> {
    this.projectAddListRef = this.bottomSheet.open(this.projectAddListTemplate, {
      hasBackdrop: true,
    });
  }

  addNewProject() {
    this.matDialog.open(AddNewProjectComponent, {
      hasBackdrop: true,
    });
  }

  addNewProjectView() {
    this.matDialog.open(AddNewProjectViewComponent, {
      hasBackdrop: true,
      data: {
        project: this.projectsRepository.store.query(getActiveEntity()),
      },
    });

    this.projectAddListRef?.dismiss();
  }

  removeProject() {
    const activeProject = this.projectsRepository.store.query(getActiveEntity());
    if (!activeProject) {
      // TODO: toast this
      return;
    }

    if (confirm(`Confirm that you want to remove the project "${activeProject.name}"`)) {
      this.projectsRepository.removeProject(activeProject._id);

      this.projectAddListRef?.dismiss();
      this.matSnackBar.open(`Project "${activeProject.name} and all its views have been removed"`, 'close', {
        duration: 5000,
      });
    }
  }

  async removeProjectView(): Promise<void> {
    const activeProjectViews: ProjectView[] = await firstValueFrom(this.activeProjectViews$);
    const selectedProjectView: ProjectView = activeProjectViews[this.activeProjectViewTab];
    if (confirm(`Confirm that you want to remove the view "${selectedProjectView.name}"`)) {
      this.projectsRepository.removeView(selectedProjectView._id);

      this.projectAddListRef?.dismiss();

      this.matSnackBar.open(`Project view "${selectedProjectView.name} has been removed"`, 'close', {
        duration: 5000,
      });
    }
  }
}
