import debug from 'debug';
import { IpcRendererEvent } from 'electron';
import { getEnv, Instance, types } from 'mobx-state-tree';

import { Events } from '../Constants';

export interface ISettings {
    gpgPath: string;
}

export interface ISaveSettingsResponse {
    error?: Error;
    settings: ISettings;
}

const log = debug('ezgpg:settingsStore');

export const SettingsStore = types
    .model('SettingsStore', {
        gpgPath: types.string,
        lastError: types.maybe(types.string)
    })
    .actions((self) => ({
        setGpgPath(gpgPath: string) {
            self.gpgPath = gpgPath;
        },

        onSaveSettings(
            event: IpcRendererEvent,
            response: ISaveSettingsResponse
        ) {
            log(
                'Save result: Error=%s - Settings=%O',
                response.error?.message,
                response.settings
            );

            if (response.settings) {
                this.onLoadSettings(event, response.settings);
            }

            self.lastError = response.error?.message;
        },

        onLoadSettings(event: IpcRendererEvent, settings: ISettings) {
            if (settings?.gpgPath) {
                self.gpgPath = settings.gpgPath;
            }
        },

        save() {
            getEnv(self).ipcRenderer.send(Events.SAVE_SETTINGS, {
                gpgPath: self.gpgPath
            });
        },

        load() {
            getEnv(self).ipcRenderer.send(Events.LOAD_SETTINGS);
        },

        afterCreate() {
            getEnv(self).ipcRenderer.on(
                Events.LOAD_SETTINGS_RESULT,
                this.onLoadSettings
            );
            getEnv(self).ipcRenderer.on(
                Events.SAVE_SETTINGS_RESULT,
                this.onSaveSettings
            );
        }
    }));
export interface ISettingsStore extends Instance<typeof SettingsStore> {}
