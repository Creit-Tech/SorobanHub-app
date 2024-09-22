import { Routes } from '@angular/router';
import { onboardingDoneGuard } from './core/guards/onboarding-done/onboarding-done.guard';
import { isUnlockedGuard } from './core/guards/is-unlocked/is-unlocked.guard';
import { IdentitiesListComponent } from './modules/settings/pages/identities-list/identities-list.component';
import { NetworksListComponent } from './modules/settings/pages/networks-list/networks-list.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  {
    path: 'lock-screen',
    canActivate: [onboardingDoneGuard(true, ['/onboarding'])],
    canActivateChild: [onboardingDoneGuard(true, ['/onboarding'])],
    loadComponent: () => import('./modules/lock-screen/lock-screen.component').then(c => c.LockScreenComponent),
  },
  {
    path: 'dashboard',
    canActivate: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    canActivateChild: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent),
  },
  {
    path: 'onboarding',
    canActivate: [onboardingDoneGuard(false, ['/dashboard'])],
    canActivateChild: [onboardingDoneGuard(false, ['/dashboard'])],
    loadComponent: () => import('./modules/onboarding/onboarding.component').then(c => c.OnboardingComponent),
  },
  {
    path: 'settings',
    canActivate: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    canActivateChild: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    loadComponent: () => import('./modules/settings/settings.component').then(c => c.SettingsComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'identities',
      },
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
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
