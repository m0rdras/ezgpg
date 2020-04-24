import { observer } from 'mobx-react-lite';
import React from 'react';
import { Dropdown, Form } from 'semantic-ui-react';

import { IGpgKeyStore } from '../stores/GpgKeyStore';
import styled from 'styled-components';

const StyledFormField = styled(Form.Field)`
    &&& {
        margin: 0 1em !important;
    }
`;

interface RecipientDropdownProps {
    keyStore: IGpgKeyStore;
}

const RecipientDropdown: React.FC<RecipientDropdownProps> = observer(
    ({ keyStore }) => {
        const recipients = keyStore.sortedKeys.map((el) => ({
            key: el.id,
            text: (el.name ?? '[unnamed]') + (el.email ? ` <${el.email}>` : ''),
            value: el.id
        }));
        return (
            <StyledFormField>
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
            </StyledFormField>
        );
    }
);

export default RecipientDropdown;
