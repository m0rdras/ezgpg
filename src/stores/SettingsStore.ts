import { flow, getEnv, Instance, types } from 'mobx-state-tree';

import { Events, SaveSettingsResponse } from '../Constants';

export type Settings = {
    gpgPath: string;
};

export const SettingsStore = types
    .model('SettingsStore', {
        gpgPath: types.string,
        lastError: types.maybe(types.string)
    })
    .actions((self) => {
        const loadSettings = (settings: Settings) => {
            if (settings?.gpgPath) {
                self.gpgPath = settings.gpgPath;
            }
        };

        return {
            setGpgPath(gpgPath: string) {
                self.gpgPath = gpgPath;
            },

            save: flow(function* save() {
                const renderer = getEnv(self).ipcRenderer;
                const {
                    settings,
                    error
                }: SaveSettingsResponse = yield renderer.invoke(
                    Events.SAVE_SETTINGS,
                    {
                        gpgPath: self.gpgPath
                    }
                );

                if (settings) {
                    loadSettings(settings);
                }

                self.lastError = error?.message;
            }),

            load: flow(function* load() {
                const renderer = getEnv(self).ipcRenderer;
                const settings: Settings = yield renderer.invoke(
                    Events.LOAD_SETTINGS
                );
                loadSettings(settings);
            })
        };
    });
export type ISettingsStore = Instance<typeof SettingsStore>;
