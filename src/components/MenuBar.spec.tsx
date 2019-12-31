import { shallow } from 'enzyme';
import React from 'react';
import { Menu } from 'semantic-ui-react';

import MenuBar, { MenuNavLink } from './MenuBar';

describe('MenuBar', () => {
    it('should render', () => {
        const wrapper = shallow(<MenuBar />);
        expect(wrapper.find(Menu.Item)).toHaveLength(4);
    });

    describe('MenuNavLink', () => {
        it('should render a React Router link with exact prop', () => {
            const wrapper = shallow(<MenuNavLink to='/' />);
            expect(wrapper.prop('exact')).toBe(true);
        });
    });
});
