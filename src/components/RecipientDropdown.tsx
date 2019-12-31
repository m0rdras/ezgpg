import React from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Form } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';

type RecipientDropdownProps = {
    keyStore: IGpgKeyStore;
};

const RecipientDropdown: React.FC<RecipientDropdownProps> = observer(
    ({ keyStore }) => {
        const recipients = keyStore.sortedKeys.map(el => ({
            key: el.id,
            text: (el.name ?? '[unnamed]') + (el.email ? ` <${el.email}>` : ''),
            value: el.id
        }));
        return (
            <Form.Field>
                <label>Recipient(s)</label>
                <Dropdown
                    placeholder='Add recipient(s)'
                    fluid
                    multiple
                    search
                    selection
                    options={recipients}
                    onChange={(event, { value }) => {
                        const val = value as string[];
                        keyStore.setSelectedKeys(val);
                    }}
                />
            </Form.Field>
        );
    }
);

export default RecipientDropdown;
