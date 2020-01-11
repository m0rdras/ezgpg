import { IpcRendererEvent } from 'electron';
import {
    applySnapshot,
    getEnv,
    getSnapshot,
    Instance,
    types
} from 'mobx-state-tree';

import { Events } from '../Constants';

export interface ISettings {
    gpgPath: string;
}

export const SettingsStore = types
    .model('SettingsStore', {
        gpgPath: types.string
    })
    .actions(self => ({
        setGpgPath(gpgPath: string) {
            self.gpgPath = gpgPath;
        },

        onLoadSettings(event: IpcRendererEvent, settings: ISettings) {
            if (settings) {
                applySnapshot(self, settings);
            }
        },

        save() {
            getEnv(self).ipcRenderer.send(
                Events.SAVE_SETTINGS,
                getSnapshot(self)
            );
        },

        load() {
            getEnv(self).ipcRenderer.send(Events.LOAD_SETTINGS);
        },

        afterCreate() {
            getEnv(self).ipcRenderer.on(
                Events.LOAD_SETTINGS_RESULT,
                this.onLoadSettings
            );
        }
    }));
export interface ISettingsStore extends Instance<typeof SettingsStore> {}
