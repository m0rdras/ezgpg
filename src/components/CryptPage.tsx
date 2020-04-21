import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form } from 'semantic-ui-react';

import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';
import { ICryptStore } from '../stores/CryptStore';
import { IGpgKeyStore } from '../stores/GpgKeyStore';

interface CryptPageProps {
    cryptStore: ICryptStore;
    gpgKeyStore: IGpgKeyStore;
}

const CryptPage: React.FC<CryptPageProps> = observer(
    ({ cryptStore, gpgKeyStore }) => {
        const { output, input } = cryptStore;

        return (
            <div style={{ height: '100%' }}>
                <Form className='cryptpage-form'>
                    <RecipientDropdown keyStore={gpgKeyStore} />
                    <div className='cryptpage-form-field-container'>
                        <CryptTextArea label='Input' text={input} />
                        <CryptTextArea label='Output' text={output} readOnly />
                    </div>
                </Form>
            </div>
        );
    }
);

export default CryptPage;
