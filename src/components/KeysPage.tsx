import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Confirm, Container, Icon } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeysTable from './KeysTable';

interface IKeysPageProps {
    keyStore: IGpgKeyStore;
}

const KeysPage: React.FC<IKeysPageProps> = observer(({ keyStore }) => {
    const [selectedId, setSelectedId] = useState<string>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const deleteKey = (keyId: string) => {
        keyStore.deleteKey(keyId);
        setConfirmDialogOpen(false);
    };

    const selectKey = (keyId: string) => {
        setSelectedId(keyId === selectedId ? undefined : keyId);
    };

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

            <KeysTable
                keys={keyStore.sortedKeys}
                selectedId={selectedId}
                onSelectKey={selectKey}
            />

            <Confirm
                open={confirmDialogOpen}
                header='Delete Key'
                content={`Are you sure you want to delete the key with id "${selectedId}"?`}
                onCancel={() => setConfirmDialogOpen(false)}
                onConfirm={() => selectedId && deleteKey(selectedId)}
            />
        </Container>
    );
});

export default KeysPage;
