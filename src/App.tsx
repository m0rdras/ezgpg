import debug from 'debug';
import { onSnapshot } from 'mobx-state-tree';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Root from './components/Root';
import createRootStore from './stores/RootStore';

const log = debug('ezgpg:main');

const rootStore = createRootStore();

log('Created root store %O', rootStore);

rootStore.load();

if (process.env.NODE_ENV === 'development') {
    onSnapshot(rootStore, snapshot => {
        log('New state snapshot: %O', snapshot);
    });
}

ReactDOM.render(<Root store={rootStore} />, document.getElementById('root'));
