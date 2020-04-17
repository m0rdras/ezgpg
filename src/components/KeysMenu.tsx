import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Confirm, Icon } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';

interface IKeysMenuProps {
    keyStore: IGpgKeyStore;
    selectedId?: string;
}

const KeysMenu: React.FC<IKeysMenuProps> = observer(
    ({ keyStore, selectedId }) => {
        const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

        const deleteKey = (keyId: string) => {
            keyStore.deleteKey(keyId);
            setConfirmDialogOpen(false);
        };

        return (
            <>
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

                <Confirm
                    open={confirmDialogOpen}
                    header='Delete Key'
                    content={`Are you sure you want to delete the key with id "${selectedId}"?`}
                    onCancel={() => setConfirmDialogOpen(false)}
                    onConfirm={() => selectedId && deleteKey(selectedId)}
                />
            </>
        );
    }
);

export default KeysMenu;
