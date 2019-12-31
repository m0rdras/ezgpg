import React from 'react';
import { observer } from 'mobx-react-lite';
import { IGpgKeyStore } from '../stores/GpgKeyStore';
import { Container, Table } from 'semantic-ui-react';

type KeysPageProps = {
    keyStore: IGpgKeyStore;
};

const KeysPage: React.FC<KeysPageProps> = observer(({ keyStore }) => {
    const rows = keyStore.sortedKeys.map(key => (
        <Table.Row key={key.id}>
            <Table.Cell>{key.id}</Table.Cell>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.email}</Table.Cell>
        </Table.Row>
    ));
    return (
        <Container>
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
