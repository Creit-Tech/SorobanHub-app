import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { onboardingDoneGuard } from './core/guards/onboarding-done/onboarding-done.guard';
import { isUnlockedGuard } from './core/guards/is-unlocked/is-unlocked.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard',
  },
  {
    path: 'lock-screen',
    canActivate: [onboardingDoneGuard(true, ['/onboarding'])],
    canActivateChild: [onboardingDoneGuard(true, ['/onboarding'])],
    loadChildren: () => import('./modules/lock-screen/lock-screen.module').then(m => m.LockScreenModule),
  },
  {
    path: 'dashboard',
    canActivate: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    canActivateChild: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'onboarding',
    canActivate: [onboardingDoneGuard(false, ['/dashboard'])],
    canActivateChild: [onboardingDoneGuard(false, ['/dashboard'])],
    loadChildren: () => import('./modules/onboarding/onboarding.module').then(m => m.OnboardingModule),
  },
  {
    path: 'settings',
    // canActivate: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    // canActivateChild: [onboardingDoneGuard(true, ['/onboarding']), isUnlockedGuard],
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableViewTransitions: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
