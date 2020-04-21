import { observer } from 'mobx-react-lite';
import React from 'react';
import { hot } from 'react-hot-loader';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Segment } from 'semantic-ui-react';

import { IRootStore } from '../stores/RootStore';
import CryptPage from './CryptPage';
import KeysPage from './KeysPage';
import MenuBar from './MenuBar';
import SettingsPage from './SettingsPage';

interface RootProps {
    store: IRootStore;
}

const Root: React.FC<RootProps> = observer(({ store }) => {
    return (
        <Router>
            <header className='app-header'>
                <MenuBar />
            </header>
            <div className='app-content'>
                <Container style={{ height: '100%' }}>
                    <Switch>
                        <Route path='/keys'>
                            <KeysPage keyStore={store.gpgKeyStore} />
                        </Route>
                        <Route path='/settings'>
                            <SettingsPage settingsStore={store.settingsStore} />
                        </Route>
                        <Route exact path='/'>
                            <CryptPage
                                cryptStore={store.cryptStore}
                                gpgKeyStore={store.gpgKeyStore}
                            />
                        </Route>
                    </Switch>
                </Container>
            </div>
            <footer className='app-footer'>
                <Segment inverted attached='bottom' className='app-footer'>
                    🟢
                </Segment>
            </footer>
        </Router>
    );
});

export default hot(module)(Root);
