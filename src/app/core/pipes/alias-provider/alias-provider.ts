import { Pipe, PipeTransform } from '@angular/core';
import { Provider } from '@app/core';

@Pipe({
    name: 'Alias',
})
export class AliasProviderPipe implements PipeTransform {
    transform(provider: Provider | undefined): string {

        const name = provider?provider.name:'N/A';
        let alias = '';
        name.split(" ").forEach((name: string) => {
            alias += name.substring(0, 1).toLocaleUpperCase();
        });

        return alias;
    }
}
