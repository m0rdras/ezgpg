import { shallow } from 'enzyme';
import React from 'react';

import { ISettingsStore, SettingsStore } from '../stores/SettingsStore';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
    let settingsStore: ISettingsStore;

    beforeEach(() => {
        settingsStore = SettingsStore.create({
            gpgPath: '/foo/bar/gpg'
        });
    });

    it('should render', () => {
        shallow(<SettingsPage settingsStore={settingsStore} />);
    });
});
