import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LockScreenService } from '../../core/services/lock-screen/lock-screen.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [
    MatCardContent,
    MatCard,
    MatFormField,
    MatInput,
    MatIcon,
    MatIconButton,
    MatButton,
    ReactiveFormsModule,
    MatLabel,
  ],
  template: `
    <mat-card class="w-[20rem]" appearance="raised">
      <mat-card-content>
        <section class="flex w-full flex-col items-center">
          <img class="mb-[1rem] w-[8rem]" src="/logo/logo.png" alt="" />

          <p class="mb-[1rem] text-center">
            SorobanHub is locked, <br />
            write your password to unlock it.
          </p>

          <mat-form-field>
            <mat-label>Enter your password</mat-label>
            <input
              (keydown.enter)="confirm()"
              [type]="hide ? 'password' : 'text'"
              [formControl]="passwordControl"
              matInput />
            <button mat-icon-button matSuffix (click)="hide = !hide">
              <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button
            (click)="confirm()"
            [disabled]="passwordControl.invalid"
            mat-raised-button
            color="primary"
            class="w-full">
            Confirm
          </button>
        </section>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      @apply flex h-screen w-full items-center justify-center;
    }
  `,
})
export class LockScreenComponent {
  hide = true;

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
