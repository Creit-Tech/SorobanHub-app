import { Injectable, NgZone } from '@angular/core';
import { LockScreenRepository } from '../../../state/lock-screen/lock-screen.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddNewProjectComponent } from '../../../shared/modals/add-new-project/add-new-project.component';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsService } from '../projects/projects.service';

@Injectable({
  providedIn: 'root',
})
export class AppMenuService {
  constructor(
    private readonly lockScreenRepository: LockScreenRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly matDialog: MatDialog,
    private readonly ngZone: NgZone,
    private readonly projectsService: ProjectsService
  ) {}

  startListeners() {
    window.ipcAPI.on({
      channel: 'menu-event',
      callback: params => {
        this.ngZone.run(() => {
          if (!this.lockScreenRepository.store.state.isUnLocked) {
            this.matSnackBar.open(`Application is locked`, `close`, {
              duration: 5000,
            });
            return;
          }

          switch (params.type) {
            case 'newProject':
              this.matDialog.open(AddNewProjectComponent, { hasBackdrop: true });
              break;

            case 'editActiveProject':
              this.projectsService.editActiveProject();
              break;

            case 'removeActiveProject':
              this.projectsService.removeActiveProject();
              break;

            default:
              this.matSnackBar.open(`${params.type} is not supported`, 'close', {
                duration: 5000,
              });
              return;
          }
        });
      },
    });
  }
}
