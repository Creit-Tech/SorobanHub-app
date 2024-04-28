import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddNewProjectComponent } from '../../shared/modals/add-new-project/add-new-project.component';
import { Project, ProjectsRepository, ProjectView } from '../../state/projects/projects.repository';
import { BehaviorSubject, delay, firstValueFrom, Observable, switchMap, tap } from 'rxjs';
import {
  deleteEntitiesByPredicate,
  getActiveEntity,
  getAllEntitiesApply,
  selectAllEntitiesApply,
  selectEntities,
  selectMany,
  setActiveId,
} from '@ngneat/elf-entities';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { AddNewProjectViewComponent } from '../../shared/modals/add-new-project-view/add-new-project-view.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Widget, WidgetsRepository, WidgetType } from '../../state/widgets/widgets.repository';
import { distinctUntilArrayItemChanged, emitOnce } from '@ngneat/elf';
import { AddNewWidgetComponent } from '../../shared/modals/add-new-widget/add-new-widget.component';
import { ProjectsService } from '../../core/services/projects/projects.service';

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
  activeProjectViewTab$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  activeProjectViewWidgets$: Observable<Widget[]> = this.activeProjectViews$.pipe(
    distinctUntilArrayItemChanged(),
    switchMap((activeProjectViews: ProjectView[]) =>
      this.activeProjectViewTab$.pipe(
        switchMap((activeProjectViewTab: number) =>
          this.widgetsRepository.store.pipe(selectMany(activeProjectViews[activeProjectViewTab]?.widgets || []))
        ),
        distinctUntilArrayItemChanged()
      )
    )
  );

  constructor(
    private readonly matDialog: MatDialog,
    private readonly projectsRepository: ProjectsRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly bottomSheet: MatBottomSheet,
    private readonly matSnackBar: MatSnackBar,
    private readonly projectsService: ProjectsService
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

  async addNewWidget() {
    const activeProjectViews: ProjectView[] = await firstValueFrom(this.activeProjectViews$);
    const selectedProjectView: ProjectView = activeProjectViews[this.activeProjectViewTab$.getValue()];

    this.matDialog.open(AddNewWidgetComponent, {
      hasBackdrop: true,
      data: { projectView: selectedProjectView },
    });

    this.projectAddListRef?.dismiss();
  }

  removeProject() {
    this.projectsService.removeActiveProject();
  }

  async removeProjectView(): Promise<void> {
    const activeProjectViews: ProjectView[] = await firstValueFrom(this.activeProjectViews$);
    const selectedProjectView: ProjectView = activeProjectViews[this.activeProjectViewTab$.getValue()];
    if (confirm(`Confirm that you want to remove the view "${selectedProjectView.name}"`)) {
      emitOnce(() => {
        this.widgetsRepository.store.update(
          deleteEntitiesByPredicate((entity: Widget): boolean => entity.projectView === selectedProjectView._id)
        );
        this.projectsRepository.removeView(selectedProjectView._id);
      });

      this.projectAddListRef?.dismiss();

      this.matSnackBar.open(`Project view "${selectedProjectView.name} has been removed"`, 'close', {
        duration: 5000,
      });
    }
  }

  protected readonly WidgetType = WidgetType;
}
