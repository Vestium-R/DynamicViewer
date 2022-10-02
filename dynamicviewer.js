import {
    settings
} from './scripts/settings.js';
import CONSTANTS from "./scripts/constants.js";
import {
    logger
} from "./scripts/logger.js";
import {
    exclusionsmanager
} from "./scripts/exclusions.js"

Hooks.on('init', CreateVideoElement)
Hooks.on('init', settings.register)
Hooks.on('getSceneControlButtons', getSceneControlButtons);
Hooks.on("renderSceneDirectory", (app, html, data) => {
    // Add the import button to the UI in the characters tab.
    const importButton = $("<button id='scene-exclusions-main-button'><i class='fas fa-file-import'></i></i>Dynamic Scene Exclusions</button>");
    html.find(".directory-footer").append(importButton);

    importButton.click(async (ev) => {
        // sbiUtils.log("Module button clicked");

        await exclusionsmanager.renderWindow();
    });
});

Hooks.on("canvasInit", checkScene);

async function checkScene() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }

    let video = document.getElementsByTagName('video')[0];

    const scene = canvas.scene;
    const bmSource = scene.background.src;


    ///****** Add your exclusions here
    let exclusions = game.settings.get('dynamicviewer', "exclusions");
	let exclusionscheck = exclusions.some(ell => bmSource.includes(ell.id))
    
	    const conditions = game.settings.get('dynamicviewer', "conditions");

   //const condtionscheck = conditions.reduce((a, c) => a + bmSource.includes(c), 0) == 2;
		let condtionscheck = conditions.some(ell => bmSource.includes(ell.id))
debugger
    if (condtionscheck && !(exclusionscheck)) {
        const checkSource = bmSource.replace(new RegExp("(.*)" + "_BM"), "$1_Scen");
        //check if matching scene file exists
        //if it does - create the journal and do more stuff
        if (await file_exists(checkSource)) {

            var lastslash = checkSource.lastIndexOf('/');
            var secondlastslash = checkSource.lastIndexOf("/", checkSource.lastIndexOf("/") - 1);
            let sceneName = checkSource.substring(lastslash + 1);
            if (sceneName == "HD_Scen.webm") {
                sceneName = checkSource.substring(secondlastslash + 1);
            }

            let createEntry = game.settings.get('dynamicviewer', "journal");
            if (createEntry) {
                let journalpermission = game.settings.get('dynamicviewer', "journalp");
				let folderName = game.settings.get('dynamicviewer', "journalfolder");
                checkJournal(scene, checkSource, sceneName, journalpermission, folderName);
				
            }
            //for (let page of journal.pages) {
            //if you don't want it to play in a screen you can also turn on auto play on the journal to bypass the script
            //if ((page.video.autoplay) && page.name == journalName) {
            if (game.user.isGM) {
                await UpdateVideoElement(video, checkSource);
                playElementVideoInPIP(video);
                //playJournalVideoInPIP(journalName, page.name, entryId);
            } else {
                //give a 2 second headstart
                await UpdateVideoElement(video, checkSource);

                playElementVideoInPIP(video);
                //playJournalVideoInPIP(journalName, page.name, entryId);
            }
            //  }
            // }
        }
    }

}

async function checkJournal(scene, checkSource, sceneName, journalpermission, folderName) {
	let folder = game.folders.find(f=>f.name === folderName);
    if(!folder) folder = await Folder.create({ name : folderName, type : `JournalEntry`, parent : ``});
	debugger
    let journalName = "DJournal - " + sceneName;
    let entryId = "";
    //check if journal exists
    let journal = game.journal.getName(journalName);
	
    if (!journal && game.user.isGM) {
        //if it doesn't - create it
        entryId = await createJournal(scene, journalName, checkSource, folder);
        journal = game.journal.getName(journalName);
        journal.update({
            [`ownership.default`]: journalpermission
        });
    } else {
        entryId = journal.id;
        //check if autoplay flag is enabled - if it is then show the journal, otherwise don't (allows for manually disabling certain scenes that you don't want to load
    }
}

async function createJournal(scene, journalName, checkSource, folder) {
    let journalData = {
        name: journalName,
		folder: folder 
    };

    let entryData = [{
        name: journalName,
        type: "video",
        src: checkSource,
        video: {
            autoplay: true,
            loop: true,
            volume: 0.2,
            width: 500,
            height: 500,
        }
    }];

    const entry = await JournalEntry.create(journalData);
    const entryId = entry.id;
    const entrypage = await entry.createEmbeddedDocuments("JournalEntryPage", entryData);
    return entryId;
}

///



async function file_exists(file) {
    return (await fetch(file)).status == 200
}
//Not in use
async function playJournalVideoInPIP(j, p, e) {
    let journal = game.journal.getName(j);
    if (!journal) return false;
    let page = journal.pages.getName(p);
    if (!page) return false;
    await showJournal(j, p);
    console.log("showJournal", {
        j,
        p,
        journal,
        page
    });
    await wait(200);
    await pictureInPictureMultiple(page.src);
    console.log("pictureInPicture", {
        j,
        p,
        journal,
        page
    });
    //await waitFor(()=> document.pictureInPictureElement);
    await closeJournal(j);
    console.log("closeJournal", {
        j,
        p,
        journal,
        page
    });

}
async function playElementVideoInPIP(video) {
    await pictureInPictureSingle(video);
    console.log("pictureInPictureSingle");


}
//not in use
async function showJournal(j, p) {
    let journal = game.journal.getName(j);
    if (!journal) return false;
    let page = journal.pages.getName(p);
    if (!page) return false;

    await journal.sheet.render(true, {
        pageId: page.id,
        sheetMode: JournalSheet.VIEW_MODES.SINGLE
    });
    //await journal.show();
}
//not in use

async function closeJournal(j) {
    let journal = game.journal.getName(j);
    if (!journal) return false;
    await journal.sheet.close();
}

async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
//not in use

function isPlaying(n) {
    let videos = document.getElementsByTagName('video');
    for (let video of videos) {
        if (!video.src.includes(n)) continue;
        return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
    }
    return false;
}

const interactions = ["contextmenu", "auxclick", "mousedown", "mouseup", "keydown"];
let listeners = [];

function play(video) {
    video.play()
    video.requestPictureInPicture();
}

async function UpdateVideoElement(v, s) {
    v.src = s; // set the file path
}

async function pictureInPictureMultiple(j) {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }
    const videos = [...document.querySelectorAll("video")];
    listeners = videos.map(video => () => {
        play(video)

        removeAllListeners()
    });
    listeners.forEach(listener => interactions.forEach(interaction => document.addEventListener(interaction, listener, {
        once: true
    })));
}
//not in use

async function pictureInPictureSingle(video) {
    if (document.pictureInPictureSingle) {
        document.exitPictureInPicture();
    }
    const videos = [video];

    listeners = videos.map(video => () => {
        play(video)
        removeAllListeners()
    });
    listeners.forEach(listener => interactions.forEach(interaction => document.addEventListener(interaction, listener, {
        once: true
    })));
}

function removeAllListeners() {
    listeners.forEach(listener => interactions.forEach(interaction => document.removeEventListener(interaction, listener)));
}

//not in use

async function playVideo(n) {
    let videos = document.getElementsByTagName('video');
    for await (let video of videos) {
        if (!video.src.includes(n) && !isPlaying(n)) continue; {
            return video.play();
        }
    }
}
//not in use

async function stopVideo(n) {
    let videos = document.getElementsByTagName('video');
    for (let video of videos) {
        if (!video.src.includes(n) && isPlaying(n)) continue;
        return video.pause();
    }
}

//Main

//------------Functions-----------
async function CreateVideoElement() {
    const video = await document.createElement("video"); // create a video element
    video.src = ""; // set the file path
    document.body.append(video); // add it to the page
    video.style.display = "none"; // to hide the video
    video.muted = true;
    return video;
}

function getSceneControlButtons(controls) {
    const sceneControls = [{
        name: CONSTANTS.EXCLUSIONS,
        title: CONSTANTS.MODULE_NAME,
        icon: 'fas fa-scroll',
        visible: true,
        onClick: () => exclusionsmanager.renderWindow(),
        button: true
    }];
    if (game.user.isGM) {
        const notes = controls.find((c) => c.name === 'notes');
        if (notes) {
            notes.tools.push(...sceneControls);
        }
    }
}
