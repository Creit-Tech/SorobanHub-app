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
import { MatLineModule, MatOption } from '@angular/material/core';
import { AddNewProjectViewComponent } from '../../shared/modals/add-new-project-view/add-new-project-view.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectViewComponent } from './components/project-view/project-view.component';
import { LedgerExpirationWidgetComponent } from './components/ledger-expiration-widget/ledger-expiration-widget.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { FunctionCallWidgetComponent } from './components/function-call-widget/function-call-widget.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatSelect } from '@angular/material/select';

@NgModule({
  declarations: [
    DashboardComponent,
    ProjectViewComponent,
    LedgerExpirationWidgetComponent,
    FunctionCallWidgetComponent,
  ],
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CdkMenu,
    CdkMenuItem,
    CdkContextMenuTrigger,
    CdkCopyToClipboard,
    MatOption,
    MatSelect,
  ],
})
export class DashboardModule {}
