import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Confirm } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeyImportDialog from './KeyImportDialog';

interface KeysMenuProps {
    keyStore: IGpgKeyStore;
    selectedId?: string;
}

enum DialogState {
    None,
    ConfirmDelete,
    ImportKey
}

const KeysMenu: React.FC<KeysMenuProps> = observer(
    ({ keyStore, selectedId }) => {
        const [dialogState, setDialogState] = useState(DialogState.None);

        const deleteKey = (keyId: string) => {
            keyStore.deleteKey(keyId);
            setDialogState(DialogState.None);
        };

        return (
            <>
                <Button
                    onClick={() => keyStore.load()}
                    icon='redo'
                    className='reload-button'
                />
                <Button
                    onClick={() => setDialogState(DialogState.ImportKey)}
                    icon='plus'
                />
                <Button
                    icon='trash'
                    disabled={!selectedId}
                    onClick={() => setDialogState(DialogState.ConfirmDelete)}
                    className='delete-button'
                />

                <Confirm
                    open={dialogState === DialogState.ConfirmDelete}
                    header='Delete Key'
                    content={`Are you sure you want to delete the key with id "${selectedId}"?`}
                    onCancel={() => setDialogState(DialogState.None)}
                    onConfirm={() => selectedId && deleteKey(selectedId)}
                />

                <KeyImportDialog
                    keyStore={keyStore}
                    open={dialogState === DialogState.ImportKey}
                    onClose={() => setDialogState(DialogState.None)}
                />
            </>
        );
    }
);

export default KeysMenu;
