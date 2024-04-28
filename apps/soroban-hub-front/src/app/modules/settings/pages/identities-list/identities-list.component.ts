import { Component } from '@angular/core';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { debounceTime, defer, map, merge, Observable, of, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddNewIdentityComponent } from '../../../../shared/modals/add-new-identity/add-new-identity.component';
import { IdentitiesService } from '../../../../core/services/identities/identities.service';
import { FormControl } from '@angular/forms';

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

  searchControl: FormControl<string | null> = new FormControl<string | null>('');

  identities$: Observable<Identity[]> = merge(
    this.searchControl.valueChanges,
    defer(() => of(this.searchControl.value))
  ).pipe(
    debounceTime(200),
    switchMap((value: string | null) => {
      return this.identitiesRepository.identities$.pipe(
        map((identities: Identity[]): Identity[] => {
          if (!value) {
            return identities;
          }

          return identities.filter((identity: Identity): boolean => {
            return identity.name.toLowerCase().includes(value) || identity.address.toLowerCase().includes(value);
          });
        })
      );
    })
  );

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
