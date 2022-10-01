import { settings } from './scripts/settings.js';
import CONSTANTS from "./scripts/constants.js";
import { logger } from "./scripts/logger.js";
import {
    exclusionsmanager
} from "./scripts/exclusions.js"


Hooks.on('init', settings.register)
Hooks.on('getSceneControlButtons', getSceneControlButtons);
Hooks.on('init', async function(){
const video = await document.createElement("video"); // create a video element
video.src = ""; // set the file path
document.body.append(video); // add it to the page
video.style.display = "none"; // to hide the video
video.muted = true;

})


function getSceneControlButtons(controls)
   {
	   const sceneControls = [
   {
      name: CONSTANTS.EXCLUSIONS,
      title: CONSTANTS.MODULE_NAME,
      icon: 'fas fa-scroll',
      visible: true,
      onClick: () => exclusionsmanager.renderWindow(),
      button: true
   }
];
      if (game.user.isGM)
      {
         const notes = controls.find((c) => c.name === 'notes');
         if (notes) { notes.tools.push(...sceneControls); }
      }
   }
   

   // sbiUtils.log("Rendering sbi button");

