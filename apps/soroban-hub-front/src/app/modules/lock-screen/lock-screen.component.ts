import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LockScreenService } from '../../core/services/lock-screen/lock-screen.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styles: [
    `
      :host {
        @apply flex h-screen w-full items-center justify-center;
      }
    `,
  ],
})
export class LockScreenComponent {
  hide: boolean = true;

  passwordControl: FormControl<string | null> = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(12),
  ]);

  constructor(
    private readonly lockScreenService: LockScreenService,
    private readonly matSnackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  async confirm(): Promise<void> {
    if (!this.passwordControl.value || this.passwordControl.invalid) {
      return;
    }

    try {
      await this.lockScreenService.unlock(this.passwordControl.value);
      this.matSnackBar.open('The app is now unlocked', 'close', {
        duration: 5000,
      });
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      console.error(e);
      this.matSnackBar.open('Invalid password', 'close', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 5000,
      });
    }
  }
}
