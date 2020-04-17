import { mount, shallow } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { ISettingsStore } from '../stores/SettingsStore';
import PathInput from './PathInput';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
    let settingsStore: ISettingsStore;

    beforeEach(() => {
        settingsStore = {
            gpgPath: '/foo/bar/gpg',
            save: jest.fn(),
            setGpgPath: jest.fn()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
    });

    it('should render', () => {
        const wrapper = shallow(<SettingsPage settingsStore={settingsStore} />);

        const pathInput = wrapper.find(PathInput);
        expect(pathInput).toHaveLength(1);
        expect(pathInput.prop('path')).toEqual(settingsStore.gpgPath);
    });

    it('should save its settings', () => {
        const wrapper = shallow(<SettingsPage settingsStore={settingsStore} />);
        const saveButton = wrapper.find('Button');
        saveButton.simulate('click');
        expect(settingsStore.setGpgPath).toHaveBeenCalledWith('/foo/bar/gpg');
        expect(settingsStore.save).toHaveBeenCalled();
    });

    describe('path changes', () => {
        const setPath = async (newPath: string) => {
            const wrapper = mount(
                <SettingsPage settingsStore={settingsStore} />
            );
            let pathInput = wrapper.find('Memo(wrappedComponent)').at(1);
            type ChangeHandler = (newPath: string) => Promise<void>;
            const changeHandler: ChangeHandler = pathInput.prop(
                'onChange'
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any;
            expect(changeHandler).not.toBeUndefined();

            await act(async () => {
                await changeHandler(newPath);
            });
            wrapper.update();
            pathInput = wrapper.find('Memo(wrappedComponent)').at(1);
            const saveButton = wrapper.find('Button').last();
            const message = wrapper.find('Message');
            return {
                errorMessage: message.prop('content'),
                path: pathInput.prop('path'),
                saveDisabled: saveButton.prop('disabled')
            };
        };

        it('with correct executables should work', async () => {
            const result = await setPath(process.execPath);
            expect(result.path).toEqual(process.execPath);
            expect(result.saveDisabled).toBe(false);
            expect(result.errorMessage).toBeNull();
        });

        it('with non executable files should be handled correctly', async () => {
            const result = await setPath('invalid/path');
            expect(result.path).toEqual('invalid/path');
            expect(result.saveDisabled).toBe(true);
            expect(result.errorMessage).not.toBeNull();
        });
    });
});
