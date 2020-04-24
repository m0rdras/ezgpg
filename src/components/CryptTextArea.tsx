import { observer } from 'mobx-react-lite';
import React, { FormEvent } from 'react';
import { Form, TextArea } from 'semantic-ui-react';

import Gpg from '../main/Gpg';
import { IIOText } from '../stores/CryptStore';
import styled from 'styled-components';

const StyledFormField = styled(Form.Field)`
    &&& {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        margin: 1em !important;
    }
`;

const StyledTextArea = styled(TextArea)`
    &&& {
        flex-grow: 1;
        color: ${(props) =>
            props.encrypted ? 'DarkRed' : 'ForestGreen'} !important;
    }
`;

interface CryptTextAreaProps {
    label?: string;
    readOnly?: boolean;
    text: IIOText;
}

const CryptTextArea: React.FC<CryptTextAreaProps> = observer(
    ({ label, readOnly, text }) => {
        return (
            <StyledFormField>
                {label && <label>{label}</label>}
                <StyledTextArea
                    onChange={(event: FormEvent<HTMLTextAreaElement>) => {
                        text.setText(event.currentTarget.value);
                    }}
                    value={text.val}
                    readOnly={readOnly}
                    encrypted={Gpg.isEncrypted(text.val)}
                />
            </StyledFormField>
        );
    }
);

export default CryptTextArea;
