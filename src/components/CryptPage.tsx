import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form, Grid, GridRow } from 'semantic-ui-react';

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
            <div>
                <Form>
                    <Grid container>
                        <GridRow>
                            <Grid.Column width={16}>
                                <RecipientDropdown keyStore={gpgKeyStore} />
                            </Grid.Column>
                        </GridRow>
                        <GridRow>
                            <Grid.Column width={8}>
                                <CryptTextArea label='Input' text={input} />
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <CryptTextArea
                                    label='Output'
                                    text={output}
                                    readOnly
                                />
                            </Grid.Column>
                        </GridRow>
                    </Grid>
                </Form>
            </div>
        );
    }
);

export default CryptPage;
