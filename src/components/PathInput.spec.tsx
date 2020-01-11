import Electron from 'electron';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { Input } from 'semantic-ui-react';
import PathInput from './PathInput';

const { dialog } = Electron.remote;

describe('PathInput', () => {
    it('should render', () => {
        const wrapper = shallow(
            <PathInput value='foo' label='bar' onChange={() => null} />
        );
        const input = wrapper.find(Input);
        expect(input).toHaveLength(1);
        expect(input.prop('value')).toEqual('foo');

        expect(wrapper.find('label').contains('bar')).toBe(true);
    });

    it('should call its change handler', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PathInput value='/some/path' label='bar' onChange={onChange} />
        );

        const changeEvent = { currentTarget: { value: '/foo' } };
        wrapper.find(Input).simulate('change', changeEvent);

        expect(onChange.mock.calls[0][0]).toEqual('/foo');
    });

    it('should accept file paths from dialog', () => {
        (dialog.showOpenDialogSync as any).mockReturnValue(['/foo']);

        const onChange = jest.fn();
        const wrapper = mount(
            <PathInput value='/some/path' label='bar' onChange={onChange} />
        );

        const btn = wrapper.find('Button');
        expect(btn).toHaveLength(1);
        btn.simulate('click');

        expect(onChange.mock.calls[0][0]).toEqual('/foo');
    });
});
