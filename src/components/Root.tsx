import React from 'react';
import { hot } from 'react-hot-loader';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { IRootStore } from '../stores/RootStore';
import CryptPage from './CryptPage';
import KeysPage from './KeysPage';
import MenuBar from './MenuBar';
import SettingsPage from './SettingsPage';

interface IRootProps {
    store: IRootStore;
}

const Root: React.FC<IRootProps> = ({ store }) => {
    return (
        <Router>
            <div>
                <MenuBar />
                <Container attached='bottom'>
                    <Switch>
                        <Route path='/keys'>
                            <KeysPage keyStore={store.gpgKeyStore} />
                        </Route>
                        <Route path='/settings'>
                            <SettingsPage />
                        </Route>
                        <Route exact path='/'>
                            <CryptPage store={store} />
                        </Route>
                    </Switch>
                </Container>
            </div>
        </Router>
    );
};

export default hot(module)(Root);
