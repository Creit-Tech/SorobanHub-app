import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatButton } from '@angular/material/button';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { IdentitiesService } from '../../../../core/services/identities/identities.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, defer, map, merge, Observable, of, switchMap } from 'rxjs';
import { AddNewIdentityComponent } from '../../../../shared/modals/add-new-identity/add-new-identity.component';

@Component({
  selector: 'app-identities-list',
  standalone: true,
  imports: [
    MatCard,
    MatFormField,
    MatIcon,
    MatSuffix,
    MatInput,
    ReactiveFormsModule,
    MatTable,
    MatCardContent,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    SlicePipe,
    CdkCopyToClipboard,
    MatHeaderCellDef,
    MatCellDef,
    MatButton,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    AsyncPipe,
    MatLabel,
  ],
  template: `
    <mat-card class="mb-[1rem] w-full max-w-3xl">
      <mat-form-field class="p-0" appearance="fill">
        <mat-label>Search Identity</mat-label>
        <input [formControl]="searchControl" matInput type="text" placeholder="You can search by name and address" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-card-content>
        <table mat-table [dataSource]="(identities$ | async) || []">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let element" class="cursor-pointer" [cdkCopyToClipboard]="element.address">
              {{ element.address | slice: 0 : 6 }}....{{ element.address | slice: -6 }}
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let element">{{ element.type }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef class="text-end"></th>
            <td mat-cell *matCellDef="let element" class="text-end">
              <!--          <button mat-button color="primary">Edit</button>-->
              <button (click)="deleteIdentity(element)" mat-button color="warn">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
    </mat-card>

    <section class="flex w-full justify-center">
      <button (click)="addNewIdentity()" mat-raised-button color="primary">Add identity</button>
    </section>
  `,
  styles: `
    :host {
      @apply flex w-full flex-col items-center justify-center;
    }
  `,
})
export class IdentitiesListComponent {
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  identitiesService: IdentitiesService = inject(IdentitiesService);
  matDialog: MatDialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'address', 'type', 'action'];

  searchControl: FormControl<string | null> = new FormControl<string | null>('');

  identities$: Observable<Identity[]> = merge(
    this.searchControl.valueChanges.pipe(debounceTime(200)),
    defer(() => of(this.searchControl.value))
  ).pipe(
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
