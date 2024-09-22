import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatDivider } from '@angular/material/divider';
import { MatCard } from '@angular/material/card';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { Widget, WidgetsRepository, WidgetType } from '../../state/widgets/widgets.repository';
import { MatListItem, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatLine } from '@angular/material/core';
import { deleteEntitiesByPredicate, getActiveEntity, selectMany, setActiveId } from '@ngneat/elf-entities';
import { distinctUntilArrayItemChanged, emitOnce } from '@ngneat/elf';
import { Project, ProjectsRepository, ProjectView } from '../../state/projects/projects.repository';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BehaviorSubject, firstValueFrom, Observable, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from '../../core/services/projects/projects.service';
import { WidgetsService } from '../../core/services/widgets/widgets.service';
import { AddNewProjectComponent } from '../../shared/modals/add-new-project/add-new-project.component';
import { AddNewProjectViewComponent } from '../../shared/modals/add-new-project-view/add-new-project-view.component';
import { DeploySacComponent } from './components/deploy-sac/deploy-sac.component';
import { FunctionCallWidgetComponent } from './components/function-call-widget/function-call-widget.component';
import { LedgerExpirationWidgetComponent } from './components/ledger-expiration-widget/ledger-expiration-widget.component';
import { InstallWasmWidgetComponent } from './components/install-wasm-widget/install-wasm-widget.component';
import { DeployContractWidgetComponent } from './components/deploy-contract-widget/deploy-contract-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbar,
    AsyncPipe,
    RouterLink,
    MatIconButton,
    MatIcon,
    MatTooltip,
    CdkContextMenuTrigger,
    MatButton,
    MatDivider,
    MatCard,
    MatTabGroup,
    MatTab,
    MatListItemTitle,
    MatLine,
    MatListItem,
    MatNavList,
    DeploySacComponent,
    FunctionCallWidgetComponent,
    LedgerExpirationWidgetComponent,
    InstallWasmWidgetComponent,
    DeployContractWidgetComponent,
    MatFabButton,
    CdkMenu,
    CdkMenuItem,
  ],
  template: `
    <mat-toolbar class="row-span-auto relative col-span-2 bg-white shadow-md">
      <!--  <button mat-icon-button class="example-icon" aria-label="Example icon-button with menu icon">-->
      <!--    <mat-icon>menu</mat-icon>-->
      <!--  </button>-->
      <img class="h-4/6" src="/logo/logo.png" alt="" />
      <!--  <span>SorobanHub</span>-->

      <span class="w-full"></span>

      @if (activeProject$ | async; as project) {
        <span>{{ project.name }}</span>
      }

      <span class="w-full"></span>

      <button mat-icon-button routerLink="/settings">
        <mat-icon>settings</mat-icon>
      </button>
    </mat-toolbar>

    <!-- Projects selector -->
    <section class="col-span-auto flex flex-col overflow-y-auto bg-[#EEEEEE] p-[1rem]">
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
    </section>
    <!-- END Projects selector -->

    @if (!!(projects$ | async)?.length) {
      @if (activeProject$ | async; as activeProject) {
        @if (activeProjectViews$ | async; as activeProjectViews) {
          <mat-tab-group
            class="col-span-1 overflow-y-auto"
            (selectedIndexChange)="activeProjectViewTab$.next($event)"
            mat-stretch-tabs="false"
            mat-align-tabs="start"
            [animationDuration]="0">
            @for (activeProjectView of activeProjectViews; track activeProjectView._id) {
              <mat-tab [label]="activeProjectView.name">
                <section class="grid w-full grid-cols-12 gap-[1rem] p-[1rem]">
                  @for (widget of activeProjectViewWidgets$ | async; track widget._id) {
                    @switch (widget.type) {
                      @case (WidgetType.LEDGER_KEY_EXPIRATION) {
                        <app-ledger-expiration-widget
                          class="col-span-12 block sm:col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2"
                          [project]="activeProject"
                          [widget]="widget">
                        </app-ledger-expiration-widget>
                      }

                      @case (WidgetType.FUNCTION_CALL) {
                        <app-function-call-widget
                          class="col-span-12 block sm:col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2"
                          [project]="activeProject"
                          [widget]="widget">
                        </app-function-call-widget>
                      }

                      @case (WidgetType.INSTALL_WASM) {
                        <app-install-wasm-widget
                          class="col-span-12 block sm:col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2"
                          [project]="activeProject"
                          [widget]="widget">
                        </app-install-wasm-widget>
                      }

                      @case (WidgetType.DEPLOY_SAC) {
                        <app-deploy-sac
                          class="col-span-12 block sm:col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2"
                          [project]="activeProject"
                          [widget]="widget">
                        </app-deploy-sac>
                      }

                      @case (WidgetType.DEPLOY_CONTRACT) {
                        <app-deploy-contract-widget
                          class="col-span-12 block sm:col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2"
                          [project]="activeProject"
                          [widget]="widget">
                        </app-deploy-contract-widget>
                      }
                    }
                  }
                </section>
              </mat-tab>
            } @empty {
              <div class="flex h-full w-full items-center justify-center">
                <h2 class="text-center opacity-50">
                  The are no views created for this project
                  <br />
                  Create a new one to start adding widgets
                </h2>
              </div>
            }
          </mat-tab-group>

          <button (click)="openAddNewList()" mat-fab color="primary" class="fixed bottom-[1rem] right-[1rem] z-30">
            <mat-icon>menu</mat-icon>
          </button>
        }
      } @else {
        <div class="flex h-full w-full items-center justify-center">
          <h2 class="text-center opacity-50">Select one of the available projects</h2>
        </div>
      }
    } @else {
      <div class="flex h-full w-full items-center justify-center">
        <h2 class="text-center opacity-50">
          There isn't any project yet
          <br />
          Create a new one and start managing it
        </h2>
      </div>
    }

    <ng-template #projectAddList>
      <mat-nav-list>
        <a (click)="addNewProjectView()" mat-list-item>
          <span matListItemTitle>Add new view</span>
          <span matLine>Add a new view to this project</span>
        </a>

        <a (click)="addNewWidget()" mat-list-item [disabled]="!(activeProjectViews$ | async)?.length">
          <span matListItemTitle>Add new widget</span>
          <span matLine>Add a new widget to the current view</span>
        </a>

        <a (click)="removeProjectView()" mat-list-item [disabled]="!(activeProjectViews$ | async)?.length">
          <span matListItemTitle>Remove view</span>
          <span matLine>Remove this view and all its widgets</span>
        </a>

        <a (click)="removeProject()" mat-list-item>
          <span matListItemTitle>Remove project</span>
          <span matLine>Delete the project, its views and widgets</span>
        </a>
      </mat-nav-list>
    </ng-template>
  `,
  styles: `
    :host {
      @apply grid h-screen w-screen overflow-y-hidden;
      grid-template-rows: auto 1fr;
      grid-template-columns: auto 1fr;
    }
  `,
})
export class DashboardComponent {
  matDialog: MatDialog = inject(MatDialog);
  projectsRepository: ProjectsRepository = inject(ProjectsRepository);
  widgetsRepository: WidgetsRepository = inject(WidgetsRepository);
  bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  projectsService: ProjectsService = inject(ProjectsService);
  widgetsService: WidgetsService = inject(WidgetsService);

  @ViewChild('projectAddList', { static: true }) projectAddListTemplate!: TemplateRef<HTMLTemplateElement>;
  projectAddListRef?: MatBottomSheetRef;

  projects$: Observable<Project[]> = this.projectsRepository.projects$;
  activeProject$: Observable<Project | undefined> = this.projectsRepository.activeProject$;
  activeProjectViews$: Observable<ProjectView[]> = this.projectsRepository.activeProjectViews$;

  activeProjectViewTab = 0;
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
    this.widgetsService.openAddNewWidget({ projectView: selectedProjectView });
    this.projectAddListRef?.dismiss();
  }

  async editProject(project?: Project): Promise<void> {
    if (project) {
      this.projectsService.editProject(project);
    } else {
      this.projectsService.editActiveProject();
    }
  }

  removeProject(project?: Project) {
    if (project) {
      this.projectsService.removeProject(project);
    } else {
      this.projectsService.removeActiveProject();
    }
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
