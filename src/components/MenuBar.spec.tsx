import React from 'react';
import { shallow } from 'enzyme';
import MenuBar, { MenuNavLink } from './MenuBar';
import { Menu } from 'semantic-ui-react';

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
