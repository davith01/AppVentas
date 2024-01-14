import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ScreenSizeService {
    private screenSizeSubject = new Subject<boolean>();
    public isLandscape: boolean | undefined;

    // Observable que emite true si el dispositivo está en modo landscape, false si está en modo portrait
    isLandscape$ = this.screenSizeSubject.asObservable();

    constructor() {
        this.checkScreenSize();
        window.addEventListener('resize', () => this.checkScreenSize());
    }

    // Método para verificar el tamaño de la pantalla y emitir el resultado al observable
    private checkScreenSize() {
        this.isLandscape = window.innerWidth > window.innerHeight;
        this.screenSizeSubject.next(this.isLandscape);
    }
}
