import debug from 'debug';
import { onSnapshot } from 'mobx-state-tree';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Root from './components/Root';
import createRootStore from './stores/RootStore';
import { createGlobalStyle } from 'styled-components';

const log = debug('ezgpg:main');

const rootStore = createRootStore();

log('Created root store %O', rootStore);

rootStore.load();

if (process.env.NODE_ENV === 'development') {
    onSnapshot(rootStore, (snapshot) => {
        log('New state snapshot: %O', snapshot);
    });
}

const GlobalStyle = createGlobalStyle`
    html,
    body {
        height: 100%;
    }
    
    html {
        box-sizing: border-box;
    }
    
    body {
        font: caption;
        margin: 0;
    }
    .app {
        -webkit-user-select: none;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
`;

const App = (
    <>
        <GlobalStyle />
        <Root store={rootStore} />
    </>
);

ReactDOM.render(App, document.getElementById('root'));
