import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseAuthenticationService } from '@app/core';
import { StorageService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
    private readonly router: Router,
    private storageService: StorageService
  ) { }

  public async canActivate(): Promise<boolean> {
    
    const user = await this.firebaseAuthenticationService.getCurrentUser();
    if (user) {
      return true;
    }
    const userAuth = await this.storageService.getUserAuth();
    if (userAuth) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
