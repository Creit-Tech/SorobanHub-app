import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
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
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { MatDialog } from '@angular/material/dialog';
import { NetworksService } from '../../../../core/services/networks/networks.service';
import { debounceTime, defer, map, merge, Observable, of, switchMap } from 'rxjs';
import { AddNewNetworkComponent } from '../../../../shared/modals/add-new-network/add-new-network.component';

@Component({
  selector: 'app-networks-list',
  standalone: true,
  imports: [
    MatCard,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    MatSuffix,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatInput,
    AsyncPipe,
    MatButton,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
  ],
  template: `
    <mat-card class="mb-[1rem] w-full max-w-3xl">
      <mat-form-field class="p-0" appearance="fill">
        <mat-label>Search Network</mat-label>
        <input
          [formControl]="searchControl"
          matInput
          type="text"
          placeholder="You can search by name, rpc url and passphrase" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-card-content>
        <table mat-table [dataSource]="(networks$ | async) || []">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <ng-container matColumnDef="rpcUrl">
            <th mat-header-cell *matHeaderCellDef>RPC URL</th>
            <td mat-cell *matCellDef="let element">
              {{ element.rpcUrl }}
            </td>
          </ng-container>

          <ng-container matColumnDef="passphrase">
            <th mat-header-cell *matHeaderCellDef>Network</th>
            <td mat-cell *matCellDef="let element">
              {{ element.networkPassphrase }}
            </td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef class="text-end"></th>
            <td mat-cell *matCellDef="let element" class="text-end">
              <!--          <button mat-button color="primary">Edit</button>-->
              <button (click)="deleteNetwork(element)" mat-button color="warn">Delete</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
    </mat-card>

    <section class="flex w-full justify-center">
      <button (click)="addNewNetwork()" mat-raised-button color="primary">Add network</button>
    </section>
  `,
  styles: `
    :host {
      @apply flex w-full flex-col items-center justify-center;
    }
  `,
})
export class NetworksListComponent {
  networksRepository: NetworksRepository = inject(NetworksRepository);
  matDialog: MatDialog = inject(MatDialog);
  networksService: NetworksService = inject(NetworksService);

  displayedColumns: string[] = ['name', 'rpcUrl', 'passphrase', 'action'];

  searchControl: FormControl<string | null> = new FormControl<string | null>('');

  networks$: Observable<Network[]> = merge(
    this.searchControl.valueChanges.pipe(debounceTime(200)),
    defer(() => of(this.searchControl.value))
  ).pipe(
    switchMap((value: string | null) => {
      return this.networksRepository.networks$.pipe(
        map((identities: Network[]): Network[] => {
          if (!value) {
            return identities;
          }

          return identities.filter((identity: Network): boolean => {
            return (
              identity.name.toLowerCase().includes(value) ||
              identity.networkPassphrase.toLowerCase().includes(value) ||
              identity.rpcUrl.toLowerCase().includes(value)
            );
          });
        })
      );
    })
  );

  addNewNetwork(): void {
    this.matDialog.open(AddNewNetworkComponent, {
      hasBackdrop: true,
    });
  }

  deleteNetwork(network: Network): void {
    if (confirm(`Confirm that you want to delete the network "${network.name}"`)) {
      this.networksService.deleteNetwork(network._id);
    }
  }
}
