//import { MonksEnhancedJournal, log, setting, i18n, makeid } from '../monks-enhanced-journal.js';
import { setting, i18n } from './settings.js';
import {
    logger
} from "./logger.js";

export class EditExclusions extends FormApplication {
    constructor(object) {
        super(object);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "edit-exclusions",
            classes: ["form", "edit-exclusions"],
            title: i18n("exclusionsmanager.title"),
            template: "modules/dynamicviewer/templates/exclusions.html",
            width: 600,
            submitOnChange: false,
            closeOnSubmit: true,
            scrollY: [".item-list"],
            dragDrop: [{ dragSelector: ".reorder", dropSelector: ".item-list" }]
        });
    }

    addAttribute(event) {
        this.exclusions.push({ id: "", name: ""});
        this.refresh();
    }
	
    static exclusionsWindowInstance = {}

	
    changeData(event) {
        let attrid = event.currentTarget.closest('li.item').dataset.id;
        let prop = $(event.currentTarget).attr("name");

        let attr = this.exclusions.find(c => c.id == attrid);
        if (attr) {
            let val = $(event.currentTarget).val();
            if (prop == "hidden" || prop == "full") {
                val = $(event.currentTarget).prop('checked');
            }
            else if (prop == "id") {
                $(event.currentTarget).val(val);
                if (!!this.exclusions.find(c => c.id == val)) {
                    $(event.currentTarget).val(attrid)
                    return;
                }
                $(event.currentTarget.closest('li.item')).attr("data-id", val);
            }

            attr[prop] = val;
        }
    }

    removeAttribute() {
        let attrid = event.currentTarget.closest('li.item').dataset.id;
        this.exclusions.findSplice(s => s.id === attrid);
        this.refresh();
    }

    refresh() {
        this.render(true);
        let that = this;
        window.setTimeout(function () {
            that.setPosition({ height: 'auto' });
        }, 100);
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('button[name="submit"]', html).click(this._onSubmit.bind(this));
        $('button[name="cancel"]', html).click(this.resetExclusions.bind(this));

        $('input[name]', html).change(this.changeData.bind(this));

        $('.item-delete', html).click(this.removeAttribute.bind(this));
        $('.item-add', html).click(this.addAttribute.bind(this));
    };

    _onDragStart(event) {
        let li = event.currentTarget.closest(".item");
        const dragData = { id: li.dataset.id };
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    _canDragStart(selector) {
        return true;
    }

    _onDrop(event) {
        // Try to extract the data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        }
        catch (err) {
            return false;
        }

        // Identify the drop target
        const target = event.target.closest(".item") || null;

        // Call the drop handler
        if (target && target.dataset.id) {
            if (data.id === target.dataset.id) return; // Don't drop on yourself

            let from = this.exclusions.findIndex(a => a.id == data.id);
            let to = this.exclusions.findIndex(a => a.id == target.dataset.id);
              logger.info('from', from, 'to', to);
            this.exclusions.splice(to, 0, this.exclusions.splice(from, 1)[0]);

            if (from < to)
                $('.item-list .item[data-id="' + data.id + '"]', this.element).insertAfter(target);
            else
                $('.item-list .item[data-id="' + data.id + '"]', this.element).insertBefore(target);
        }
    }
}

export class exclusionsmanager extends EditExclusions {
    constructor(object) {
        super(object);
    }

    getData(options) {
        this.exclusions = this.exclusions || setting("exclusions");
        return mergeObject(super.getData(options),
            {
                fields: this.exclusions
            }
        );
    }

    _updateObject() {
        let data = this.exclusions.filter(c => !!c.id);
        game.settings.set('dynamicviewer', 'exclusions', data);
        this.submitting = true;
    }

    resetExclusions() {
        this.exclusions = game.settings.settings.get('dynamicviewer.exclusions').default;
        this.refresh();
    }
	
    static async renderWindow() {
        exclusionsmanager.exclusionsWindowInstance = new exclusionsmanager();
        exclusionsmanager.exclusionsWindowInstance.render(true);
    }
}