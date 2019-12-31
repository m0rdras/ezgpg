import { shallow } from 'enzyme';
import React from 'react';

import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
    it('should render', () => {
        shallow(<SettingsPage />);
    });
});
