import { Component, inject } from '@angular/core';
import { SorobanRpc, Transaction } from '@stellar/stellar-sdk';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { StellarService } from '../../../core/services/stellar/stellar.service';

@Component({
  selector: 'app-xdr-export',
  standalone: true,
  providers: [],
  imports: [MatFormField, MatInput, ReactiveFormsModule, MatLabel, MatButton, MatSnackBarModule, ClipboardModule],
  template: `
    <section class="w-[25rem] p-[1rem]">
      <mat-form-field class="w-full">
        <mat-label>XDR</mat-label>
        <textarea [rows]="10" matInput [formControl]="textAreaControl"></textarea>
      </mat-form-field>

      <div class="flex w-full gap-[1rem]">
        <button (click)="copyXdr()" mat-raised-button color="primary" class="w-full">Copy</button>

        <button (click)="sign()" mat-raised-button color="primary" class="w-full">Sign</button>

        <button
          [disabled]="!signedXdr || submitting"
          (click)="submit()"
          mat-raised-button
          color="primary"
          class="w-full">
          @if (submitting) {
            Sending...
          } @else {
            Submit
          }
        </button>
      </div>
    </section>
  `,
  styles: ``,
})
export class XdrExportComponent {
  data: { tx: Transaction; rpcUrl: string } = inject(DIALOG_DATA);
  clipboard: Clipboard = inject(Clipboard);
  dialogRef: DialogRef = inject(DialogRef);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  stellarService: StellarService = inject(StellarService);

  textAreaControl: FormControl<string | null> = new FormControl<string | null>(this.data.tx.toXDR());
  signedXdr?: string | undefined;
  submitting = false;

  copyXdr(): void {
    this.clipboard.copy(this.data.tx.toXDR());
    this.matSnackBar.open(`XDR copied to clipboard`, 'close', {
      duration: 5000,
    });
    this.dialogRef.close();
  }

  async sign(): Promise<void> {
    await this.stellarService.kit.openModal({
      onWalletSelected: async option => {
        this.stellarService.kit.setWallet(option.id);
        try {
          const { signedTxXdr } = await this.stellarService.kit.signTransaction(this.data.tx.toXDR(), {
            networkPassphrase: this.data.tx.networkPassphrase,
            address: this.data.tx.source,
          });
          this.signedXdr = signedTxXdr;
        } catch (e: unknown) {
          console.log(e);
          this.matSnackBar.open((e as Error).message, 'Error', { duration: 5000 });
        }
      },
    });
  }

  async submit(): Promise<void> {
    if (!this.signedXdr) return;
    this.submitting = true;

    try {
      const tx = new Transaction(this.signedXdr, this.data.tx.networkPassphrase);
      await this.stellarService.submit({ tx, rpcUrl: this.data.rpcUrl });
      this.signedXdr = undefined;
      this.matSnackBar.open('Transaction submitted', undefined, { duration: 5000 });
    } catch (e) {
      console.error(e);
    }

    this.submitting = false;
  }
}
