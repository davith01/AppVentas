import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'Alias',
})
export class AliasProviderPipe implements PipeTransform {
    transform(provider: any): string {

        const name = provider.name;
        let alias = '';
        name.split(" ").forEach((name: string) => {
            alias += name.substring(0, 1).toLocaleUpperCase();
        });

        return alias;
    }
}
