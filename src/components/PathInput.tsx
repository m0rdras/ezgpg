import Electron from 'electron';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, Form, Input } from 'semantic-ui-react';

const { dialog } = Electron.remote;

interface IPathInputProps {
    path: string;
    label: string;
    onChange: (path: string) => void;
}

const PathInput: React.FC<IPathInputProps> = observer(
    ({ path, label, onChange }) => {
        const onSelectFileButtonClick = () => {
            const fileName = dialog.showOpenDialogSync({
                defaultPath: path,
                properties: ['openFile']
            });
            if (fileName?.length === 1) {
                onChange(fileName[0]);
            }
        };

        return (
            <Form.Field>
                <label>{label}</label>
                <div>
                    <Input
                        value={path}
                        onChange={event => onChange(event.currentTarget.value)}
                        label={
                            <Button
                                icon='folder open'
                                onClick={onSelectFileButtonClick}
                            />
                        }
                        labelPosition='right'
                    />
                </div>
            </Form.Field>
        );
    }
);

export default PathInput;
