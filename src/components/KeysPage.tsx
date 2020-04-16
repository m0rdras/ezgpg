import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Confirm, Container, Icon, Table } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';

interface IKeysPageProps {
    keyStore: IGpgKeyStore;
}

const KeysPage: React.FC<IKeysPageProps> = observer(({ keyStore }) => {
    const [selectedId, setSelectedId] = useState<string>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const deleteKey = (keyId?: string) => {
        if (keyId) {
            keyStore.deleteKey(keyId);
        }
        setConfirmDialogOpen(false);
    };

    const selectRow = (keyId: string) => {
        setSelectedId(keyId === selectedId ? undefined : keyId);
    };

    const rows = keyStore.sortedKeys.map((key) => (
        <Table.Row
            key={key.id}
            active={selectedId === key.id}
            onClick={() => selectRow(key.id)}
        >
            <Table.Cell>{key.id}</Table.Cell>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.email}</Table.Cell>
        </Table.Row>
    ));

    return (
        <Container>
            <Button
                onClick={() => keyStore.load()}
                icon
                className='reload-button'
            >
                <Icon name='redo' />
            </Button>
            <Button icon>
                <Icon name='plus' />
            </Button>
            <Button
                icon
                disabled={!selectedId}
                onClick={() => setConfirmDialogOpen(true)}
                className='delete-button'
            >
                <Icon name='trash' />
            </Button>

            <Table celled selectable style={{ cursor: 'pointer' }}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>{rows}</Table.Body>
            </Table>

            <Confirm
                open={confirmDialogOpen}
                header='Delete Key'
                content={`Are you sure you want to delete the key with id "${selectedId}"?`}
                onCancel={() => setConfirmDialogOpen(false)}
                onConfirm={() => deleteKey(selectedId)}
            />
        </Container>
    );
});

export default KeysPage;
