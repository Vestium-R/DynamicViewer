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
    const importButton = $("<button id='scene-exclusions-main-button'><i class='fas fa-image-slash'></i></i>Dynamic Scene Exclusions</button>");
    html.find(".directory-footer").append(importButton);

    importButton.click(async (ev) => {
        // sbiUtils.log("Module button clicked");

        await exclusionsmanager.renderWindow();
    });
	

});

Hooks.on("canvasInit", prepare);

async function prepare() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }

    const scene = canvas.scene;
    const bmSource = scene.background.src;
	const bmName = scene.name;
///*****
let istoggled = game.settings.get('dynamicviewer', "enabled");
if (!istoggled)
{
	return;
}
    ///****** Add your exclusions here
    let exclusions = game.settings.get('dynamicviewer', "exclusions");
    let exclusionschecksource = exclusions.some(ell => bmSource.includes(ell.id))
    let exclusionscheckname = exclusions.some(ell => bmName.includes(ell.id))

    const conditions = game.settings.get('dynamicviewer', "conditions");

    //const condtionscheck = conditions.reduce((a, c) => a + bmSource.includes(c), 0) == 2;
    let condtionscheck = conditions.some(ell => bmSource.includes(ell.id))

    if (condtionscheck && !(exclusionschecksource) && !(exclusionscheckname)) {
        let originextcheckSource = bmSource.replace(new RegExp("(.*)" + "_BM"), "$1_Scen");
        var re = /(?:\.([^.]+))?$/;
        var extension = re.exec(bmSource)[1];

        if (extension === "webm") {
            if (file_exists(originextcheckSource)) {
                Main(originextcheckSource, scene, extension);
            }

        } else {
			let unsupportjournals = game.settings.get('dynamicviewer', "journalunsup");
if (unsupportjournals)
{
            JournalHandler(originextcheckSource, scene, extension)
}
        }


    }

}
async function JournalHandler(Source, scene, extension) {
    var lastslash = Source.lastIndexOf('/');

    var secondlastslash = Source.lastIndexOf("/", Source.lastIndexOf("/") - 1);

    let sceneName = Source.substring(lastslash + 1);
    if (sceneName == "HD_Scen.webm") {
        sceneName = Source.substring(secondlastslash + 1);
    }

    let createEntry = game.settings.get('dynamicviewer', "journal");
    if (createEntry) {
        let journalpermission = game.settings.get('dynamicviewer', "journalp");
        let folderName = game.settings.get('dynamicviewer', "journalfolder");
        checkJournal(scene, Source, sceneName, journalpermission, folderName, extension);

    }
}
async function Main(Source, scene, extension) {



    let video = document.getElementsByTagName('video')[0];


    JournalHandler(Source, scene, extension)


    let playervisible = game.settings.get('dynamicviewer', "visibiltydv");
    if (game.user.isGM) {
        
        await UpdateVideoElement(video, Source);
        playElementVideoInPIP(video);

    } else {

        if (playervisible) {
            await UpdateVideoElement(video, Source);
            playElementVideoInPIP(video);

        }
    }


}


async function checkJournal(scene, Source, sceneName, journalpermission, folderName, extension) {
    let folder = game.folders.find(f => f.name === folderName);
    if (!folder) folder = await Folder.create({
        name: folderName,
        type: `JournalEntry`,
        parent: ``
    });
    var journalp = Number(journalpermission);
    
    let journalName = "DJournal - " + sceneName;
    let entryId = "";
    //check if journal exists
    let journal = game.journal.getName(journalName);

    if (!journal && game.user.isGM) {
        //if it doesn't - create it
        if (extension === "webm") {
            entryId = await createJournalVid(scene, journalName, Source, folder);
        } else {
            if (game.settings.get('dynamicviewer', "journalunsup")) {
                entryId = await createJournalPic(scene, journalName, Source, folder);
            }
        }
        journal = game.journal.getName(journalName);

        journal.update({
            [`ownership.default`]: journalp
        });
    } else {
        entryId = journal.id;
        //check if autoplay flag is enabled - if it is then show the journal, otherwise don't (allows for manually disabling certain scenes that you don't want to load
    }
}

async function createJournalVid(scene, journalName, Source, folder) {
    let journalData = {
        name: journalName,
        folder: folder
    };

    let entryData = [{
        name: journalName,
        type: "video",
        src: Source,
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

async function createJournalPic(scene, journalName, Source, folder) {
    let journalData = {
        name: journalName,
        folder: folder
    };

    let entryData = [{
        name: journalName,
        type: "picture",
        src: Source,
    }];

    const entry = await JournalEntry.create(journalData);
    const entryId = entry.id;
    const entrypage = await entry.createEmbeddedDocuments("JournalEntryPage", entryData);
    return entryId;
}
///


function file_exists(file) {
    if (file) {
        var req = new XMLHttpRequest();
        req.open('GET', file, false);
        req.send();
        return req.status == 200;
    } else {
        return false;
    }
}

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

async function play(video) {
    await playVideo(video);
    video.requestPictureInPicture();
}

async function UpdateVideoElement(v, s) {
    v.src = s; // set the file path
}

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

async function playVideo(n) {
    return n.play();
}

async function stopVideo(n) {

    return n.pause();

}

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
        icon: 'fas fa-object-exclude',
        visible: true,
        onClick: () => exclusionsmanager.renderWindow(),
        button: true
    }];
	    const sceneModuleControls = [{
        name: "Toggle the Dynamic Viewer",
        title: "Dynamic Viewer Toggle",
        icon: 'fas fa-image-slash',
        visible: true,
		toggle: true,
		active: game.settings.get("dynamicviewer","enabled") ?? false,
        onClick: toggled => ToggleDynamicViewer(toggled),
    }];
    if (game.user.isGM) {
        const notes = controls.find((c) => c.name === 'notes');
        if (notes) {
            notes.tools.push(...sceneControls);
			notes.tools.push(...sceneModuleControls);
        }

    }
}

function ToggleDynamicViewer(toggled)
{

	let istoggled = game.settings.get('dynamicviewer', "enabled");

			game.settings.set('dynamicviewer', "enabled", toggled);
		
}