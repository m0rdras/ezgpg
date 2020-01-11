import { shallow } from 'enzyme';
import React from 'react';

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
        } as any;
    });

    it('should render', () => {
        const wrapper = shallow(<SettingsPage settingsStore={settingsStore} />);

        const pathInput = wrapper.find(PathInput);
        expect(pathInput).toHaveLength(1);
        expect(pathInput.prop('path')).toEqual(settingsStore.gpgPath);
    });

    /*
    it('should save current settings when clicking Save button', async () => {
        const wrapper = mount(<SettingsPage settingsStore={settingsStore} />);
        const pathInputChangeHandler = wrapper.find(PathInput).prop('onChange');
        act(() => {
            pathInputChangeHandler(process.execPath);
        });

        const saveHandler = wrapper
            .find(Button)
            .at(1)
            .prop('onClick') as any;

        await new Promise(resolve =>
            setTimeout(() => {
                act(() => {
                    saveHandler?.();
                });
                expect(
                    (settingsStore.setGpgPath as jest.Mock<any>).mock
                        .calls[0][0]
                ).toEqual('/new/path');

                resolve();
            }, 1)
        );
    });
    */
});
