import {
    logger
} from "./logger.js";
import CONSTANTS from "./constants.js";
import {
    exclusionsmanager
} from "./exclusions.js"

export let setting = key => {
    return game.settings.get("dynamicviewer", key);
};
export let i18n = key => {
    return game.i18n.localize(key);
};
 let permissions = {};
    permissions[CONST.USER_ROLES.PLAYER] = 'Player';
    permissions[CONST.USER_ROLES.TRUSTED] = 'Trusted Player';
    permissions[CONST.USER_ROLES.ASSISTANT] = 'Assistant GM';
    permissions[CONST.USER_ROLES.GAMEMASTER] = 'Game Master';
    permissions[5] = 'None';
	

export class settings {
   
    static get isV10() {
        return game.release?.generation >= 10;
    }

    static get id() {
        return settings.isV10 ? settings.data.id : settings.data.name;

    }

    static value(str) {
        return game.settings.get(settings.id, str);
    }

    static i18n(key) {
        return game.i18n.localize(key);
    }

    static register_module(key) {
        const module = game.modules.get(key);
        settings.data = settings.isV10 ? module : module.data;
    }



    static register() {
        settings.register_module(CONSTANTS.MODULE_ID);
        settings.register_settings();
        settings.register_settings2();

    }

    static reload() {
        if (!this.isV10) setTimeout(() => window.location.reload(), 500);
    }

    static register_settings() {
        const settingData = {
            journal: {
                scope: "world",
                config: true,
                default: true,
                type: Boolean
            },
	 journalp: {
      scope: "world",
      config: true,
      default: CONST.USER_ROLES.GAMEMASTER,
      choices: permissions,
      type: String,
    },			
            visibilty: {
                scope: "world",
                config: true,
                default: false,
                type: Boolean
            },
			exclusions: {
				scope: "world",
		config: false,
		default: [
			{ id: 'world_map', name: "Test"},
			{ id: 'world_maps', name: "Test2"},
		],
		type: Array,
			},

        };
		
        Object.entries(settingData).forEach(([key, data]) => {
            game.settings.register(
                settings.id, key, {
                    name: settings.i18n(`settings.${key}.title`),
                    hint: settings.i18n(`settings.${key}.hint`),
                    ...data
                }
            );
        })

    }
    static register_settings2() {
        const settingData2 = {
            exclusionsmanager: {
                scope: "world",
                config: true,
                restricted: true,
				icon:"fas fa-cog",
				label: "test",
                type: exclusionsmanager
            }
        };



        Object.entries(settingData2).forEach(([key, data]) => {
            game.settings.registerMenu(
                settings.id, key, {
                    name: settings.i18n(`${key}.title`),
                    hint: settings.i18n(`${key}.hint`),
					label: settings.i18n(`${key}.label`),
                    ...data
                }
            );
        })
    }

}