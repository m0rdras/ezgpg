import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, Container, Icon, Table } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';

interface IKeysPageProps {
    keyStore: IGpgKeyStore;
}

const KeysPage: React.FC<IKeysPageProps> = observer(({ keyStore }) => {
    const rows = keyStore.sortedKeys.map((key) => (
        <Table.Row key={key.id}>
            <Table.Cell>{key.id}</Table.Cell>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.email}</Table.Cell>
        </Table.Row>
    ));
    return (
        <Container>
            <Button onClick={() => keyStore.load()} icon>
                <Icon name='redo' />
            </Button>
            {/* not yet */}
            {/*<Button icon>*/}
            {/*    <Icon name='plus' />*/}
            {/*</Button>*/}
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>{rows}</Table.Body>
            </Table>
        </Container>
    );
});

export default KeysPage;
