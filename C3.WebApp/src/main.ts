import {Aurelia} from 'aurelia-framework';
import {SystemNode} from './system-context-diagram/system-node';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging();

    aurelia.container.registerTransient(SystemNode);
    
    //Uncomment the line below to enable animation.
    //aurelia.use.plugin('aurelia-animator-css');

    //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
    //aurelia.use.plugin('aurelia-html-import-template-loader')

    aurelia.start().then(() => aurelia.setRoot());
}
