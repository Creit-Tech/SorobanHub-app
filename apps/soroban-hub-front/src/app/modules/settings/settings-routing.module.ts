import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { IdentitiesListComponent } from './pages/identities-list/identities-list.component';
import { NetworksListComponent } from './pages/networks-list/networks-list.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'identities',
        component: IdentitiesListComponent,
      },
      {
        path: 'networks',
        component: NetworksListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
