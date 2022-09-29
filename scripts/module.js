import { settings } from './settings.js';


Hooks.on('init', settings.register);

Hooks.once('ready', async function() {

});
