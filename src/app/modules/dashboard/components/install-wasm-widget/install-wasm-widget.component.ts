import { Component, inject, Input } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatDivider } from '@angular/material/divider';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { InstallWASMWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';
import { BehaviorSubject, distinctUntilKeyChanged, filter, map, Observable, switchMap } from 'rxjs';
import { Project } from '../../../../state/projects/projects.repository';
import {
  Account,
  hash,
  Operation,
  SorobanDataBuilder,
  rpc as SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { getEntity } from '@ngneat/elf-entities';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-install-wasm-widget',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    AsyncPipe,
    CdkMenuTrigger,
    MatIconButton,
    MatIcon,
    MatCardContent,
    MatCardSubtitle,
    CdkCopyToClipboard,
    MatCardActions,
    MatButton,
    CdkMenu,
    CdkMenuItem,
    MatDivider,
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
          <mat-card-subtitle> Install WASM widget </mat-card-subtitle>

          <ul class="py-[0.5rem] text-[0.75rem]">
            <li><b>File:</b> {{ fileName$ | async }}</li>

            @if (widget.source; as source) {
              <li><b>Source account:</b> {{ source | slice: 0 : 4 }}....{{ source | slice: -4 }}</li>
            }

            @if (fileDataHash$ | async; as fileDataHash) {
              <li class="cursor-pointer" [cdkCopyToClipboard]="fileDataHash">
                <b>Contract hash:</b> {{ fileDataHash | slice: 0 : 4 }}....{{ fileDataHash | slice: -4 }}
              </li>
            }
          </ul>
        </mat-card-content>

        <mat-card-actions class="flex w-full flex-col">
          <button (click)="install()" class="w-full" mat-raised-button color="primary">Install</button>
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
export class InstallWasmWidgetComponent {
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

  widget$: BehaviorSubject<InstallWASMWidget | undefined> = new BehaviorSubject<InstallWASMWidget | undefined>(
    undefined
  );
  @Input() set widget(data: InstallWASMWidget) {
    this.widget$.next(data);
  }

  fileName$: Observable<string | undefined> = this.widget$.asObservable().pipe(
    map(widget => {
      return widget?.fileName;
    })
  );

  fileDataHash$: Observable<string> = this.widget$.asObservable().pipe(
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    map((widget: InstallWASMWidget): string => widget.fileData),
    switchMap(async (fileData: string): Promise<string> => {
      return hash(Buffer.from(fileData, 'base64')).toString('hex');
    })
  );

  // TODO: it could be a good idea to check if the WASM is already installed and notify if that's the case
  async install() {
    const widget: InstallWASMWidget = this.widget$.getValue()!;
    const project: Project = this.project$.getValue()!;
    const identity: Identity | undefined = this.identitiesRepository.store.query(getEntity(project.defaultIdentityId));
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project.networkId));

    if (!identity) {
      this.matSnackBar.open(`Identity is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    if (!network) {
      this.matSnackBar.open(`Network is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    const rpc: SorobanRpc.Server = this.stellarService.createRPC(network.rpcUrl);

    let account: Account;
    try {
      account = await rpc.getAccount(widget.source || identity.address);
    } catch (e: unknown) {
      console.error(e);
      this.matSnackBar.open(
        `Account ${widget.source || identity.address} doesn't exist in the network ${network.name}`,
        'close',
        {
          duration: 5000,
        }
      );
      return;
    }

    let contractData: Buffer;
    let contractDataHash: Buffer;
    try {
      contractData = Buffer.from(widget.fileData, 'base64');
      contractDataHash = hash(contractData);
    } catch (e: unknown) {
      console.error(e);
      this.matSnackBar.open(`Failed to get the file data, make sure the file exists`, 'close', {
        duration: 5000,
      });
      return;
    }

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(contractData),
        })
      )
      .setSorobanData(
        new SorobanDataBuilder()
          .setReadWrite([xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: contractDataHash }))])
          .build()
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
    const widget: InstallWASMWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }

  async remove(): Promise<void> {
    const widget: InstallWASMWidget | undefined = this.widget$.getValue();

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
