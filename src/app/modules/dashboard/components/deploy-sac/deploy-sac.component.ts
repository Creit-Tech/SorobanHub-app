import { Component, inject, Input } from '@angular/core';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { DeploySACWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';
import { BehaviorSubject, distinctUntilKeyChanged, filter, map, Observable, of, switchMap, withLatestFrom } from 'rxjs';
import { Project } from '../../../../state/projects/projects.repository';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatDivider } from '@angular/material/divider';
import { getEntity, selectEntity } from '@ngneat/elf-entities';
import { Account, Asset, Operation, SorobanRpc, Transaction, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';

@Component({
  selector: 'app-deploy-sac',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardHeader,
    MatIcon,
    CdkMenuTrigger,
    MatIconButton,
    MatCardContent,
    MatCardSubtitle,
    CdkCopyToClipboard,
    MatCardActions,
    CdkMenu,
    MatDivider,
    MatButton,
    CdkMenuItem,
    SlicePipe,
  ],
  template: `
    @if (widget$ | async; as widget) {
      <mat-card>
        <mat-card-header class="text-[1.25rem]">
          <div class="flex w-full items-center justify-between">
            <span>{{ widget.name }}</span>

            <button [cdkMenuTriggerFor]="menuItemContext" mat-icon-button>
              <mat-icon>menu</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-card-subtitle> Deploy SAC widget </mat-card-subtitle>

          <ul class="py-[0.5rem] text-[0.75rem]">
            <li><b>Code:</b> {{ widget.code }}</li>

            <li [cdkCopyToClipboard]="widget.issuer" class="cursor-pointer">
              <b>Issuer:</b> {{ widget.issuer | slice: 0 : 4 }}....{{ widget.issuer | slice: -4 }}
            </li>

            @if (contractId$ | async; as contractId) {
              <li [cdkCopyToClipboard]="contractId" class="cursor-pointer">
                <b>Contract ID:</b> {{ contractId | slice: 0 : 4 }}....{{ contractId | slice: -4 }}
              </li>
            }

            @if (widget.source; as source) {
              <li><b>Source account:</b> {{ source | slice: 0 : 4 }}....{{ source | slice: -4 }}</li>
            }
          </ul>
        </mat-card-content>

        <mat-card-actions class="flex w-full flex-col">
          <button (click)="deploy()" class="w-full" mat-raised-button color="primary">Deploy</button>
        </mat-card-actions>
      </mat-card>

      <ng-template #menuItemContext>
        <mat-card cdkMenu>
          <button (click)="edit()" mat-button cdkMenuItem class="px-[1.5rem]">Edit</button>
          <mat-divider></mat-divider>
          <button (click)="remove()" mat-button cdkMenuItem class="px-[1.5rem]">Remove</button>
        </mat-card>
      </ng-template>
    }
  `,
  styles: ``,
})
export class DeploySacComponent {
  networksRepository: NetworksRepository = inject(NetworksRepository);
  widgetsRepository: WidgetsRepository = inject(WidgetsRepository);
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  matDialog: MatDialog = inject(MatDialog);
  stellarService: StellarService = inject(StellarService);
  widgetsService: WidgetsService = inject(WidgetsService);

  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<DeploySACWidget | undefined> = new BehaviorSubject<DeploySACWidget | undefined>(undefined);
  @Input() set widget(data: DeploySACWidget) {
    this.widget$.next(data);
  }

  contractId$: Observable<string> = this.project$.asObservable().pipe(
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    switchMap((project: Project) => this.networksRepository.store.pipe(selectEntity(project.networkId))),
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    switchMap((network: Network) =>
      this.widget$.pipe(filter(Boolean), distinctUntilKeyChanged('_id'), withLatestFrom(of(network)))
    ),
    map(([widget, network]): string => new Asset(widget.code, widget.issuer).contractId(network.networkPassphrase))
  );

  // TODO: if the contract is already deployed, we should notify the user
  async deploy(): Promise<void> {
    const widget: DeploySACWidget | undefined = this.widget$.getValue();
    const project: Project | undefined = this.project$.getValue();
    const identity: Identity | undefined = this.identitiesRepository.store.query(
      getEntity(project?.defaultIdentityId || '')
    );
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project?.networkId || ''));

    if (!widget || !project || !identity || !network) {
      this.matSnackBar.open(
        `The widget/project/identity/network entity is undefined, make sure all of them are valid or contact support.`,
        'close',
        { duration: 5000 }
      );
      return;
    }

    const rpc: SorobanRpc.Server = new SorobanRpc.Server(network.rpcUrl);

    let account: Account;
    try {
      account = await rpc.getAccount(identity.address);
    } catch (e: unknown) {
      console.error(e);
      this.matSnackBar.open(`Account ${identity.address} doesn't exist in the network ${network.name}`, 'close', {
        duration: 5000,
      });
      return;
    }

    const asset: Asset = new Asset(widget.code, widget.issuer);

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeCreateContract(
            new xdr.CreateContractArgs({
              contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(asset.toXDRObject()),
              executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
            })
          ),
          auth: [],
        })
      )
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
        rpcUrl: network.rpcUrl,
      },
    });
  }

  async edit(): Promise<void> {
    const widget: DeploySACWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }

  async remove(): Promise<void> {
    const widget: DeploySACWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    if (confirm(`Confirm that you want to remove the widget "${widget.name}"`)) {
      this.widgetsRepository.deleteWidget(widget._id);

      this.matSnackBar.open(`Widget "${widget.name} has been removed"`, 'close', {
        duration: 5000,
      });
    }
  }
}
