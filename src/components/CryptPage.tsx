import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form } from 'semantic-ui-react';

import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';
import { ICryptStore } from '../stores/CryptStore';
import { IGpgKeyStore } from '../stores/GpgKeyStore';
import styled from 'styled-components';

const StyledForm = styled(Form)`
    &&& {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
`;

const TextAreaContainer = styled.div`
    display: flex;
    flex-grow: 1;
`;

interface CryptPageProps {
    cryptStore: ICryptStore;
    gpgKeyStore: IGpgKeyStore;
}

const CryptPage: React.FC<CryptPageProps> = observer(
    ({ cryptStore, gpgKeyStore }) => {
        const { output, input } = cryptStore;

        return (
            <StyledForm>
                <RecipientDropdown keyStore={gpgKeyStore} />
                <TextAreaContainer>
                    <CryptTextArea label='Input' text={input} />
                    <CryptTextArea label='Output' text={output} readOnly />
                </TextAreaContainer>
            </StyledForm>
        );
    }
);

export default CryptPage;
