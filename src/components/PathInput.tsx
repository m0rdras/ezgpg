import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form } from 'semantic-ui-react';

interface IPathInputProps {
    value: string;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PathInput: React.FC<IPathInputProps> = observer(
    ({ value, label, onChange }) => {
        return (
            <Form.Field>
                <label>{label}</label>
                <input value={value} onChange={onChange} />
            </Form.Field>
        );
    }
);

export default PathInput;
