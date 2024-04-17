import { Component } from '@angular/core';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddNewNetworkComponent } from '../../../../shared/modals/add-new-network/add-new-network.component';
import { NetworksService } from '../../../../core/services/networks/networks.service';

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
  networks$: Observable<Network[]> = this.networksRepository.networks$;

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
