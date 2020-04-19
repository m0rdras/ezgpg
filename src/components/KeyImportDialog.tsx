import { observer } from 'mobx-react-lite';
import React, { useState, FormEvent } from 'react';
import { Button, Form, Modal, TextArea } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';

interface KeyImportDialogProps {
    keyStore: IGpgKeyStore;
    open: boolean;
    onClose: () => void;
}

const KeyImportDialog: React.FC<KeyImportDialogProps> = observer(
    ({ keyStore, open, onClose }) => {
        const [curText, setCurText] = useState('');

        const onImportClick = () => {
            keyStore.importKey(curText);
            onClose();
        };

        const onTextChange = (event: FormEvent<HTMLTextAreaElement>) => {
            setCurText(event.currentTarget.value);
        };

        return (
            <Modal open={open} closeIcon={true} onClose={() => onClose()}>
                <Modal.Header>Import Key</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <label>Key</label>
                            <TextArea
                                placeholder='Paste key here'
                                rows={20}
                                onChange={onTextChange}
                                value={curText}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={onImportClick}
                        primary
                        disabled={curText === ''}
                    >
                        Import
                    </Button>
                    <Button onClick={() => onClose()}>Close</Button>
                </Modal.Actions>
            </Modal>
        );
    }
);

export default KeyImportDialog;
