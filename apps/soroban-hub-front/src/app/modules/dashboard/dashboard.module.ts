import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddNewProjectComponent } from '../../shared/modals/add-new-project/add-new-project.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatLineModule } from '@angular/material/core';
import { AddNewProjectViewComponent } from '../../shared/modals/add-new-project-view/add-new-project-view.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    AddNewProjectComponent,
    MatDialogModule,
    MatTabsModule,
    MatListModule,
    MatLineModule,
    AddNewProjectViewComponent,
    MatTooltipModule,
  ],
})
export class DashboardModule {}
