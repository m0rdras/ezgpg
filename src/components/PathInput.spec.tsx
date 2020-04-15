import Electron from 'electron';
import { mount, ReactWrapper, shallow } from 'enzyme';
import React from 'react';
import { Input } from 'semantic-ui-react';
import PathInput from './PathInput';

const { dialog } = Electron.remote;

describe('PathInput', () => {
    it('should render', () => {
        const wrapper = shallow(
            <PathInput path='foo' label='bar' onChange={() => null} />
        );
        const input = wrapper.find(Input);
        expect(input).toHaveLength(1);
        expect(input.prop('value')).toEqual('foo');

        expect(wrapper.find('label').contains('bar')).toBe(true);
    });

    it('should call its change handler', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <PathInput path='/some/path' label='bar' onChange={onChange} />
        );

        const changeEvent = { currentTarget: { value: '/foo' } };
        wrapper.find(Input).simulate('change', changeEvent);

        expect(onChange.mock.calls[0][0]).toEqual('/foo');
    });

    describe('using a file selection dialog', () => {
        let onChange: jest.Mock;
        let wrapper: ReactWrapper;
        let btn: ReactWrapper;

        beforeEach(() => {
            onChange = jest.fn();
            wrapper = mount(
                <PathInput path='/some/path' label='bar' onChange={onChange} />
            );

            btn = wrapper.find('Button');
            expect(btn).toHaveLength(1);
        });

        it('should accept file paths from dialog', () => {
            (dialog.showOpenDialogSync as any).mockReturnValue(['/foo']);

            btn.simulate('click');

            expect(onChange).toHaveBeenCalledWith('/foo');
        });

        it('should handle cancelled file selection', () => {
            (dialog.showOpenDialogSync as any).mockReturnValue(undefined);

            btn.simulate('click');

            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
