import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ScreenSize {
    isLandscape: boolean,
    isSmallScreen: boolean,
}

@Injectable({
    providedIn: 'root',
})
export class ScreenSizeService {
    private screenSizeSubject = new Subject<ScreenSize>();
    public isLandscape: boolean = false;
    public isSmallScreen: boolean = false;

    // Observable que emite true si el dispositivo está en modo landscape, false si está en modo portrait
    isLandscape$ = this.screenSizeSubject.asObservable();

    constructor() {
        this.checkScreenSize();
        window.addEventListener('resize', () => this.checkScreenSize());
    }

    // Método para verificar el tamaño de la pantalla y emitir el resultado al observable
    private checkScreenSize() {
        this.isLandscape = window.innerWidth > 720;
        this.isSmallScreen = window.innerWidth < 460;

        this.screenSizeSubject.next(
            {
                isLandscape: this.isLandscape,
                isSmallScreen: this.isSmallScreen
            });
    }
}
