import React from 'react';
import { observer } from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';

type SettingsPageProps = {};

const SettingsPage: React.FC<SettingsPageProps> = observer(() => {
    return <Container>Settings</Container>;
});

export default SettingsPage;
