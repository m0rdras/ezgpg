import { observer } from 'mobx-react-lite';
import React from 'react';
import { hot } from 'react-hot-loader';
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, Segment } from 'semantic-ui-react';
import styled, { keyframes } from 'styled-components';

import { IRootStore } from '../stores/RootStore';
import CryptPage from './CryptPage';
import KeysPage from './KeysPage';
import MenuBar from './MenuBar';
import SettingsPage from './SettingsPage';

interface RootProps {
    store: IRootStore;
}

const fadein = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const AppWrapper = styled.div`
    animation: ${fadein} 0.5s;
`;

const AppHeader = styled.header``;

const AppContent = styled.div`
    position: absolute;
    top: 4em;
    bottom: 4em;
    overflow: auto;
    width: 100%;
    padding: 1em;
`;

const AppFooter = styled.footer`
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 4em;
    text-align: right;
`;

const AppFooterSegment = styled(Segment)`
    &&& {
        position: absolute;
    }
`;

const Root: React.FC<RootProps> = observer(({ store }) => {
    return (
        <Router>
            <AppWrapper>
                <AppHeader>
                    <MenuBar />
                </AppHeader>
                <AppContent>
                    <Container style={{ height: '100%' }}>
                        <Switch>
                            <Route path='/keys'>
                                <KeysPage keyStore={store.gpgKeyStore} />
                            </Route>
                            <Route path='/settings'>
                                <SettingsPage
                                    settingsStore={store.settingsStore}
                                />
                            </Route>
                            <Route exact path='/'>
                                <CryptPage
                                    cryptStore={store.cryptStore}
                                    gpgKeyStore={store.gpgKeyStore}
                                />
                            </Route>
                        </Switch>
                    </Container>
                </AppContent>
                <AppFooter>
                    <AppFooterSegment inverted attached='bottom'>
                        🟢
                    </AppFooterSegment>
                </AppFooter>
            </AppWrapper>
        </Router>
    );
});

export default hot(module)(Root);
