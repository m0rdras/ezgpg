import Electron from 'electron';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, Form, Input } from 'semantic-ui-react';

const { dialog } = Electron.remote;

interface IPathInputProps {
    value: string;
    label: string;
    onChange: (path: string) => void;
}

const PathInput: React.FC<IPathInputProps> = observer(
    ({ value, label, onChange }) => {
        const onSelectFileButtonClick = () => {
            const fileName = dialog.showOpenDialogSync({
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
                        value={value}
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
