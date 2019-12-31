import React, { FormEvent } from 'react';
import { Form, TextArea } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';
import { IIOText } from '../stores/CryptStore';
import Gpg from '../main/Gpg';

type CryptTextAreaProps = {
    label?: string;
    readOnly?: boolean;
    text: IIOText;
};

const CryptTextArea: React.FC<CryptTextAreaProps> = observer(
    ({ label, readOnly, text }) => {
        return (
            <Form.Field>
                {label && <label>{label}</label>}
                <TextArea
                    rows={20}
                    onChange={(event: FormEvent<HTMLTextAreaElement>) => {
                        text.setText(event.currentTarget.value);
                    }}
                    value={text.val}
                    readOnly={readOnly}
                    className={
                        'crypttextarea ' +
                        (Gpg.isEncrypted(text.val) ? 'encrypted' : 'decrypted')
                    }
                />
            </Form.Field>
        );
    }
);

export default CryptTextArea;