import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import KeysTable from './KeysTable';
import KeysMenu from './KeysMenu';

interface IKeysPageProps {
    keyStore: IGpgKeyStore;
}

const KeysPage: React.FC<IKeysPageProps> = observer(({ keyStore }) => {
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const selectKey = (keyId: string) => {
        setSelectedId(keyId === selectedId ? undefined : keyId);
    };

    return (
        <Container>
            <KeysMenu keyStore={keyStore} selectedId={selectedId} />

            <KeysTable
                keys={keyStore.sortedKeys}
                selectedId={selectedId}
                onSelectKey={selectKey}
            />
        </Container>
    );
});

export default KeysPage;
