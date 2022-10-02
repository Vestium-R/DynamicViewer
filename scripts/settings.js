import {
    logger
} from "./logger.js";
import CONSTANTS from "./constants.js";
import {
    exclusionsmanager
} from "./exclusions.js"
import {
    conditionsmanager
} from "./conditions.js"

export let setting = key => {
    return game.settings.get("dynamicviewer", key);
};
export let i18n = key => {
    return game.i18n.localize(key);
};
let permissions = {};
permissions[CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER] = 'Player Observer';
permissions[CONST.DOCUMENT_PERMISSION_LEVELS.NONE] = 'Game Master';

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
			            visibiltydv: {
                scope: "world",
                config: true,
                default: true,
                type: Boolean
            },
            journal: {
                scope: "world",
                config: true,
                default: true,
                type: Boolean
            },
			      journalunsup: {
                scope: "world",
                config: true,
                default: false,
                type: Boolean
            },
            journalp: {
                scope: "world",
                config: true,
                default: CONST.DOCUMENT_PERMISSION_LEVELS.NONE,
                choices: permissions,
                type: String,
            },
			            journalfolder: {
                scope: "world",
                config: true,
                default: "Dynamic Viewer",
                type: String,
            },
            conditions: {
                scope: "world",
                config: false,
                default: [{
                        id: 'beneos'
                    },
                    {
                        id: '_BM'
                    },
                ],
                type: Array,
            },

            exclusions: {
                scope: "world",
                config: false,
                default: [{
                        id: 'Barovia_Map'
                    },
                    {
                        id: '2_Wachter_2F'
                    },
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
                icon: "fas fa-cog",
                type: exclusionsmanager
            },
			            conditionsmanager: {
                scope: "world",
                config: true,
                restricted: true,
                icon: "fas fa-cog",
                type: conditionsmanager
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