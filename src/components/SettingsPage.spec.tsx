import React from 'react';
import { shallow } from 'enzyme';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
    it('should render', () => {
        shallow(<SettingsPage />);
    });
});
