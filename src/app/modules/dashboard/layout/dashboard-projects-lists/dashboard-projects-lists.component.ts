import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { distinctUntilChanged, filter, forkJoin, Observable, switchMap } from 'rxjs';
import { Project, ProjectsRepository } from '../../../../state/projects/projects.repository';
import { AddNewProjectComponent } from '../../../../shared/modals/add-new-project/add-new-project.component';
import { MatDialog } from '@angular/material/dialog';
import { getEntity, selectAllEntitiesApply, setActiveId } from '@ngneat/elf-entities';
import { ProjectsService } from '../../../../core/services/projects/projects.service';
import { NetworksRepository } from '../../../../state/networks/networks.repository';
import { Networks } from '@stellar/stellar-sdk';

@Component({
  selector: 'app-dashboard-projects-lists',
  standalone: true,
  imports: [
    AsyncPipe,
    CdkMenu,
    MatTooltip,
    MatIcon,
    CdkContextMenuTrigger,
    MatButton,
    MatCard,
    MatDivider,
    CdkMenuItem,
    MatIconButton,
  ],
  template: `
    @for (project of projects$ | async; track project._id) {
      <div
        class="relative mb-[1rem] w-full"
        [matTooltip]="project.name"
        matTooltipPosition="right"
        matTooltipShowDelay="500">
        @if ((activeProject$ | async)?._id === project._id) {
          <mat-icon class="absolute top-1/2" style="transform: translate(-100%, -50%)">arrow_right</mat-icon>
        }

        @if (project.img) {
          <button
            (click)="onProjectSelected(project)"
            [cdkContextMenuTriggerFor]="projectItemContext"
            class="h-[4rem] w-[4rem] bg-cover bg-center"
            style="background-image: url({{ project.img }})"
            mat-raised-button>
            <i></i>
          </button>
        } @else {
          <button
            (click)="onProjectSelected(project)"
            [cdkContextMenuTriggerFor]="projectItemContext"
            class="h-[4rem] w-[4rem] bg-[#FAFAFA] bg-cover bg-center"
            mat-raised-button>
            {{ project.name.slice(0, 1) }}
          </button>
        }

        <ng-template #projectItemContext>
          <mat-card cdkMenu>
            <button mat-button cdkMenuItem class="px-[1.5rem]" (click)="onProjectSelected(project)">Select</button>
            <mat-divider></mat-divider>
            <button mat-button cdkMenuItem class="px-[1.5rem]" (click)="editProject(project)">Edit</button>
            <mat-divider></mat-divider>
            <button mat-button cdkMenuItem class="px-[1.5rem]" (click)="removeProject(project)">Remove</button>
          </mat-card>
        </ng-template>
      </div>
    }

    <div class="flex w-full items-center justify-center">
      <button (click)="addNewProject()" mat-icon-button color="primary">
        <mat-icon>add_circle</mat-icon>
      </button>
    </div>
  `,
  styles: ``,
})
export class DashboardProjectsListsComponent {
  projectsRepository: ProjectsRepository = inject(ProjectsRepository);
  projectsService: ProjectsService = inject(ProjectsService);
  matDialog: MatDialog = inject(MatDialog);
  networksRepository: NetworksRepository = inject(NetworksRepository);

  projects$: Observable<Project[]> = forkJoin([
    this.networksRepository.persist!.initialized$,
    this.projectsRepository.persist!.initialized$,
  ])
    .pipe(switchMap(() => this.networksRepository.activePassphrase$))
    .pipe(filter(Boolean))
    .pipe(distinctUntilChanged())
    .pipe(
      switchMap((activePassphrase: Networks) => {
        return this.projectsRepository.store.pipe(
          selectAllEntitiesApply({
            filterEntity: entity =>
              this.networksRepository.store.query(getEntity(entity.networkId))?.networkPassphrase === activePassphrase,
          })
        );
      })
    );
  activeProject$: Observable<Project | undefined> = this.projectsRepository.activeProject$;

  addNewProject() {
    this.matDialog.open(AddNewProjectComponent, {
      hasBackdrop: true,
    });
  }

  onProjectSelected(project: Project) {
    this.projectsRepository.store.update(setActiveId(project._id));
  }

  async editProject(project?: Project): Promise<void> {
    if (project) {
      this.projectsService.editProject(project);
    } else {
      this.projectsService.editActiveProject();
    }
  }

  removeProject(project: Project) {
    this.projectsService.removeProject(project);
  }
}
