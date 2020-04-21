import { observer } from 'mobx-react-lite';
import React, { FormEvent } from 'react';
import { Form, TextArea } from 'semantic-ui-react';

import Gpg from '../main/Gpg';
import { IIOText } from '../stores/CryptStore';

interface CryptTextAreaProps {
    label?: string;
    readOnly?: boolean;
    text: IIOText;
}

const CryptTextArea: React.FC<CryptTextAreaProps> = observer(
    ({ label, readOnly, text }) => {
        return (
            <Form.Field className='cryptpage-form-field'>
                {label && <label>{label}</label>}
                <TextArea
                    onChange={(event: FormEvent<HTMLTextAreaElement>) => {
                        text.setText(event.currentTarget.value);
                    }}
                    value={text.val}
                    readOnly={readOnly}
                    className={
                        'cryptpage-form-field-textarea ' +
                        (Gpg.isEncrypted(text.val) ? 'encrypted' : 'decrypted')
                    }
                />
            </Form.Field>
        );
    }
);

export default CryptTextArea;
