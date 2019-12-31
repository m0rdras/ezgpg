import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Form, GridRow } from 'semantic-ui-react';

import CryptTextArea from './CryptTextArea';
import RecipientDropdown from './RecipientDropdown';
import { IRootStore } from '../stores/RootStore';

type CryptPageProps = {
    store: IRootStore;
};

const CryptPage: React.FC<CryptPageProps> = observer(({ store }) => {
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
