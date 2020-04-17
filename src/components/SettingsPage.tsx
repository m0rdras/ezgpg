import debug from 'debug';
import fs from 'fs';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';

import { ISettingsStore } from '../stores/SettingsStore';
import PathInput from './PathInput';

const log = debug('ezgpg:SettingsPage');
const { access } = fs.promises;

interface SettingsStoreProps {
    settingsStore: ISettingsStore;
}

const SettingsPage: React.FC<SettingsStoreProps> = observer(
    ({ settingsStore }) => {
        const [curGpgPath, setCurGpgPath] = useState(settingsStore.gpgPath);
        const [saveDisabled, setSaveDisabled] = useState(true);
        const [curError, setCurError] = useState(null);

        const onSaveClick = () => {
            log('Saving current path %s', curGpgPath);
            setSaveDisabled(true);
            settingsStore.setGpgPath(curGpgPath);
            settingsStore.save();
        };

        const onChangePath = async (newPath: string) => {
            setCurGpgPath(newPath);
            try {
                await access(newPath, fs.constants.X_OK);
                setCurError(null);
                setSaveDisabled(newPath === settingsStore.gpgPath);
            } catch (err) {
                setCurError(err.toString());
                setSaveDisabled(true);
            }
        };

        return (
            <div>
                <Form error={curError !== null}>
                    <PathInput
                        path={curGpgPath}
                        label='Path to GnuPG executable'
                        onChange={onChangePath}
                    />
                    <Message
                        error
                        header='File not found or not executable'
                        content={curError}
                    />
                    <Button
                        type='submit'
                        disabled={saveDisabled}
                        onClick={onSaveClick}
                    >
                        Save
                    </Button>
                </Form>
            </div>
        );
    }
);

export default SettingsPage;
