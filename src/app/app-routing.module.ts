import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from '@app/core';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
    import('./modules/login/login.module').then((m) => m.LoginPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'client-detail',
    loadChildren: () => import('./modules/client-detail/client-detail.module').then(m => m.ClientDetailPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadChildren: () => import('./modules/tabs/tabs.module').then(m => m.TabsPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
