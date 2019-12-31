import debug from 'debug';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Root from './components/Root';
import createRootStore from './stores/RootStore';
import { onSnapshot } from 'mobx-state-tree';

const log = debug('ezgpg:main');

const rootStore = createRootStore();

onSnapshot(rootStore, snapshot => {
    log('New state snapshot: %O', snapshot);
    // localStorage.setItem('snapshot', JSON.stringify(snapshot));
});

rootStore.gpgKeyStore.load();

ReactDOM.render(<Root store={rootStore} />, document.getElementById('root'));