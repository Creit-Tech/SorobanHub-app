import { Component } from '@angular/core';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { debounceTime, defer, map, merge, Observable, of, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddNewNetworkComponent } from '../../../../shared/modals/add-new-network/add-new-network.component';
import { NetworksService } from '../../../../core/services/networks/networks.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-networks-list',
  templateUrl: './networks-list.component.html',
  styles: `
    :host {
      @apply flex w-full flex-col items-center justify-center;
    }
  `,
})
export class NetworksListComponent {
  displayedColumns: string[] = ['name', 'rpcUrl', 'passphrase', 'action'];

  searchControl: FormControl<string | null> = new FormControl<string | null>('');

  networks$: Observable<Network[]> = merge(
    this.searchControl.valueChanges,
    defer(() => of(this.searchControl.value))
  ).pipe(
    debounceTime(200),
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

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly matDialog: MatDialog,
    private readonly networksService: NetworksService
  ) {}

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
