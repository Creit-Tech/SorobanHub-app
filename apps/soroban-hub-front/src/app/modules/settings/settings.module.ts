import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { IdentitiesListComponent } from './pages/identities-list/identities-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AddNewIdentityComponent } from '../../shared/modals/add-new-identity/add-new-identity.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NetworksListComponent } from './pages/networks-list/networks-list.component';
import { MatFormField, MatHint, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SettingsComponent, IdentitiesListComponent, NetworksListComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    AddNewIdentityComponent,
    MatDialogModule,
    MatInput,
    MatFormField,
    MatLabel,
    MatHint,
    MatSuffix,
    ReactiveFormsModule,
  ],
})
export class SettingsModule {}
