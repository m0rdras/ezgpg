import React from 'react';
import { observer } from 'mobx-react-lite';
import { IGpgKey } from '../stores/GpgKeyStore';
import { Table } from 'semantic-ui-react';

interface KeysTableProps {
    keys: IGpgKey[];
    selectedId?: string;
    onSelectKey: (keyId: string) => void;
}

const KeysTable: React.FC<KeysTableProps> = observer(
    ({ keys, selectedId, onSelectKey }) => {
        const rows = keys.map((key) => (
            <Table.Row
                key={key.id}
                active={selectedId === key.id}
                onClick={() => onSelectKey(key.id)}
            >
                <Table.Cell>{key.id}</Table.Cell>
                <Table.Cell>{key.name}</Table.Cell>
                <Table.Cell>{key.email}</Table.Cell>
            </Table.Row>
        ));

        return (
            <Table celled selectable style={{ cursor: 'pointer' }}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>{rows}</Table.Body>
            </Table>
        );
    }
);

export default KeysTable;
