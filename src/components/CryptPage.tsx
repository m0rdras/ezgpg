import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form, Grid, GridRow } from 'semantic-ui-react';

import { IRootStore } from '../stores/RootStore';
import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';

interface ICryptPageProps {
    store: IRootStore;
}

const CryptPage: React.FC<ICryptPageProps> = observer(({ store }) => {
    const { output, input } = store.cryptStore;

    return (
        <div>
            <Form>
                <Grid container>
                    <GridRow>
                        <Grid.Column width={16}>
                            <RecipientDropdown keyStore={store.gpgKeyStore} />
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
});

export default CryptPage;
