import { Component } from '@angular/core';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddNewIdentityComponent } from '../../../../shared/modals/add-new-identity/add-new-identity.component';
import { IdentitiesService } from '../../../../core/services/identities/identities.service';

@Component({
  selector: 'app-identities-list',
  templateUrl: './identities-list.component.html',
  styles: `
    :host {
      @apply flex w-full flex-col items-center justify-center;
    }
  `,
})
export class IdentitiesListComponent {
  displayedColumns: string[] = ['name', 'address', 'type', 'action'];

  identities$: Observable<Identity[]> = this.identitiesRepository.identities$;

  constructor(
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly identitiesService: IdentitiesService,
    private readonly matDialog: MatDialog
  ) {}

  addNewIdentity(): void {
    this.matDialog.open(AddNewIdentityComponent, {
      hasBackdrop: true,
    });
  }

  deleteIdentity(identity: Identity): void {
    if (confirm(`Confirm that you want to delete the identity "${identity.name}"`)) {
      this.identitiesService.deleteIdentity(identity._id);
    }
  }
}
