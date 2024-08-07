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
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { FunctionCallWidgetComponent } from './components/function-call-widget/function-call-widget.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatSelect } from '@angular/material/select';
import { InstallWasmWidgetComponent } from './components/install-wasm-widget/install-wasm-widget.component';
import { DeploySacComponent } from './components/deploy-sac/deploy-sac.component';
import { DeployContractWidgetComponent } from './components/deploy-contract-widget/deploy-contract-widget.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProjectViewComponent,
    LedgerExpirationWidgetComponent,
    FunctionCallWidgetComponent,
    InstallWasmWidgetComponent,
    DeploySacComponent,
    DeployContractWidgetComponent,
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
    CdkMenuTrigger,
  ],
})
export class DashboardModule {}
