import { hot } from 'react-hot-loader';
import React from 'react';
import { Container } from 'semantic-ui-react';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import { IRootStore } from '../stores/RootStore';
import CryptPage from './CryptPage';
import KeysPage from './KeysPage';
import SettingsPage from './SettingsPage';
import MenuBar from './MenuBar';

type RootProps = {
    store: IRootStore;
};

const Root: React.FC<RootProps> = ({ store }) => {
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
