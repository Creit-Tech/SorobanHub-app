import { Component, Inject } from '@angular/core';
import { Transaction } from '@stellar/stellar-sdk';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-xdr-export',
  standalone: true,
  providers: [],
  imports: [MatFormField, MatInput, ReactiveFormsModule, MatLabel, MatButton, MatSnackBarModule, ClipboardModule],
  templateUrl: './xdr-export.component.html',
  styles: ``,
})
export class XdrExportComponent {
  textAreaControl: FormControl<string | null> = new FormControl<string | null>(this.data.tx.toXDR());

  constructor(
    @Inject(DIALOG_DATA)
    public readonly data: { tx: Transaction },
    private readonly clipboard: Clipboard,
    private readonly dialogRef: DialogRef,
    private readonly matSnackBar: MatSnackBar
  ) {}

  copyXdr(): void {
    this.clipboard.copy(this.data.tx.toXDR());
    this.matSnackBar.open(`XDR copied to clipboard`, 'close', {
      duration: 5000,
    });
    this.dialogRef.close();
  }
}
