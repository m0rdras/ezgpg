import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { Header, Icon, Menu } from 'semantic-ui-react';

export const MenuNavLink: React.FC<NavLinkProps> = (props) => (
    <NavLink exact {...props} />
);

const MenuBar: React.FC = () => (
    <Menu attached='top' pointing style={{ marginBottom: '2em' }}>
        <Menu.Item>
            <Header>
                <Icon name='key' /> ezgpg
            </Header>
        </Menu.Item>
        <Menu.Item as={MenuNavLink} to='/' name='home' />
        <Menu.Item as={MenuNavLink} to='/keys' name='keys' />
        <Menu.Item as={MenuNavLink} to='/settings' name='settings' />
    </Menu>
);

export default MenuBar;
