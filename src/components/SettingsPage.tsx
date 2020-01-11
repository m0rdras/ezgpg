import debug from 'debug';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { ISettingsStore } from '../stores/SettingsStore';
import PathInput from './PathInput';

const log = debug('ezgpg:SettingsPage');

interface ISettingsStoreProps {
    settingsStore: ISettingsStore;
}

const SettingsPage: React.FC<ISettingsStoreProps> = observer(
    ({ settingsStore }) => {
        const [curGpgPath, setCurGpgPath] = useState(settingsStore.gpgPath);
        const [saveDisabled, setSaveDisabled] = useState(true);

        const onSaveClick = () => {
            log('Saving current path %s', curGpgPath);
            settingsStore.setGpgPath(curGpgPath);
            settingsStore.save();
        };

        useEffect(() => {
            setSaveDisabled(curGpgPath === settingsStore.gpgPath);
        });

        return (
            <div>
                <Form>
                    <PathInput
                        value={curGpgPath}
                        label='Path to GnuPG executable'
                        onChange={setCurGpgPath}
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
