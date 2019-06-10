/***
 * file name : addOn.js
 * description : addOn static class
 * create date : 2018-12-05
 * creator : saltgamer
 ***/

export default class addOn {
    constructor() {
        throw new Error('-> This is static class. Creating instances is forbidden.');
    }

    static init(noteSync) {
        noteSync.addOn.forEach(data => {
            let bridge = null;
            if (data.bridge) {
                bridge = addOn.getAddOnBridge(data.bridge);
            }
            noteSync.addOnObj[data.barId] = {
                syncData: data.syncData,
                currentIndex: 0,
                currentSyncStart: noteSync.startTime,
                currentSyncEnd: noteSync.startTime + (data.syncData[0] * noteSync.beat),
                bridge: bridge
            };
            noteSync.addOnData[data.barId + 'Map'] = new Map();
            addOn.initNote(noteSync.svgs, data.barId);

            addOn.initNoteMap(noteSync, data, bridge);

            console.log('~> ' + data.barId + ' noteCount: ', data.syncData.length);

        });
    }

    static initNote(svgs, barId) {
        let index = 0;
        svgs.forEach((value, idx) => {

            const svgElement = document.querySelector('#' + value);
            // console.log('~> addOn svgElement: ', svgElement);
            // console.log('~> addOn id: ', '#'+ barId + (idx + 1));
            const bar = svgElement.querySelector('#' + barId + '_' + (idx + 1));
            // console.log('~> addOn bar: ', bar);

            if (bar) {
                for (let i = 0; i < bar.childNodes.length; i++) {
                    if (bar.childNodes[i].nodeName !== '#text' && bar.childNodes[i].getAttribute('pass') !== 'true') {
                        bar.childNodes[i].setAttribute('id', this.getNoteId(barId, index));
                        bar.childNodes[i].setAttribute('svgId', idx + 1);
                        index++;
                    }
                }
            } else {
                const oBar = svgElement.querySelector('#bar_' + (idx + 1));
                for (let i = 0; i < oBar.childNodes.length; i++) {
                    if (oBar.childNodes[i].nodeName !== '#text' && oBar.childNodes[i].getAttribute('pass') !== 'true') {
                        index++;
                    }
                }
            }

        });
    }

    static getNoteId(barId, syncIndex) {
        let index = syncIndex + 1;
        if (index < 10) {
            index = barId + 'Note_' + '00' + index;
        } else if (index < 100) {
            index = barId + 'Note_' + '0' + index;
        } else {
            index = barId + 'Note_' + index;
        }

        return index;
    }

    static getAddOnBridge(bridge) {
        const addOnBridge = [];

        bridge.forEach((value) => {
            addOnBridge.push({
                interval: value.end - value.start,
                startNote: value.startNote,
                endNote: value.endNote
            });

        });

        console.log('--> addOnBridge: ', addOnBridge);

        return addOnBridge;

    }

    static initNoteMap(noteSync, data, bridge) {
        let _start = noteSync.startTime,
            _end = noteSync.startTime + (data.syncData[0] * noteSync.beat);

        data.syncData.forEach((value, idx) => {
            const target = addOn.getNoteId(data.barId, idx);

            _start = (idx === 0 ? _start : _end);
            _end = (idx === 0 ? _end : _end + (data.syncData[idx] * noteSync.beat));

            let isBridge = false,
                interval = 0;

            if (bridge) {
                for (let i = 0; i < bridge.length; i++) {
                    if (addOn.isBridegNote(target, bridge[i].startNote, bridge[i].endNote, data.barId)) {
                        console.log('~> isBridegNote: ', target);
                        /*   _start = _start + this.bridge[i].interval;
                           _end = _end + this.bridge[i].interval;*/
                        isBridge = true;
                        interval = bridge[i].interval;
                    }
                }
            }

            // console.log('------_start: ', _start);
            noteSync.addOnData[data.barId + 'Map'].set(target, {
                element: noteSync.svgElement.querySelector('#' + target),
                target: target,
                index: idx,
                duration: value,
                syncStart: (isBridge ? _start + interval : _start),
                syncEnd: (isBridge ? _end + interval : _end),
                section: addOn.getCurrentSection(target, data.barId, data.sections)
            });

        });
    }

    static isBridegNote(target, startNote, endNote, barId) {
        let isBridge = false;
        target = target.replace(barId, '');
        startNote = startNote.replace(barId, '');
        endNote = endNote.replace(barId, '');

        if (startNote <= target && endNote >= target) {
            isBridge = true;
        }

        return isBridge;
    }

    static getPrevNoteId(noteId, barId) {
        // console.log('--> getPrevNoteId: ', noteId);
        const note = noteId.split('_')[1];
        // console.log('-note: ', note);
        return addOn.getNoteId(barId, note - 2);

    }

    static getCurrentSection(noteId, barId, sections) {
        let start, end, currentNote, result;
        for (let i = 0; i < sections.length - 1; i++) {
            start = sections[i];
            end = addOn.getPrevNoteId(sections[i + 1], barId);

            start = start.split('_')[1];
            end = end.split('_')[1];
            currentNote = noteId.split('_')[1];

            /*  console.log('--------------------------------------------');
              console.log('- noteId: ', noteId);
              console.log('- start: ', start);
              console.log('- end: ', end);
              console.log('--------------------------------------------');*/

            if (parseInt(start) <= parseInt(currentNote) && parseInt(end) >= parseInt(currentNote)) {
                result = i + 1;
            }
        }
        return result;

    }

    static noteChecker(noteSync) {
        for (let id in noteSync.addOnObj) {
            console.log('~> currentTime: ', noteSync.currentTime);
            console.log('~> currentSyncStart: ', noteSync.addOnObj[id].currentSyncStart);
            if (noteSync.currentTime >= noteSync.addOnObj[id].currentSyncStart) {
                addOn.onSymbol(noteSync, addOn.getNoteId(id, noteSync.addOnObj[id].currentIndex));
            }

            if (noteSync.currentTime >= noteSync.addOnObj[id].currentSyncEnd) {
                addOn.offSymbol(noteSync, addOn.getNoteId(id, noteSync.addOnObj[id].currentIndex));
                addOn.updateSync(noteSync, noteSync.addOnObj[id], id);

            }

        }
    }

    static updateSync(noteSync, addOnObj, id) {
        addOnObj.currentIndex++;
        addOnObj.currentSyncStart = addOnObj.currentSyncEnd;
        addOnObj.currentSyncEnd += addOnObj.syncData[addOnObj.currentIndex] * noteSync.beat;

        if (addOnObj.bridge) {
            for (let i = 0; i < addOnObj.bridge.length; i++) {
                if (addOn.getNoteId(id, addOnObj.currentIndex) === addOnObj.bridge[i].startNote) {
                    addOnObj.currentSyncStart += addOnObj.bridge[i].interval;
                    addOnObj.currentSyncEnd += addOnObj.bridge[i].interval;
                }
            }
        }

    }

    static onSymbol(noteSync, target) {

        const targetElement = noteSync.svgElement.querySelector('#' + target);
        console.log('~> onSymbol: ', targetElement);
        if (targetElement) {
            targetElement.style.fill = noteSync.fillColor;

        }

    }

    static offSymbol(noteSync, target) {
        const targetElement = noteSync.svgElement.querySelector('#' + target);
        if (targetElement) {
            targetElement.style.fill = '#000';
        }

    }

    static endSync(noteSync) {
        for (let id in noteSync.addOnObj) {

            noteSync.addOnObj[id].currentIndex = 0;
            noteSync.addOnObj[id].currentSyncStart = noteSync.startTime;
            noteSync.addOnObj[id].currentSyncEnd = noteSync.startTime + (noteSync.addOnObj[id].syncData[0] * noteSync.beat);

            noteSync.addOnData[id + 'Map'].forEach(value => {
                if (value.element) {
                    value.element.style.fill = '#000';
                }
            });

            console.log('~> endSync: ', noteSync.addOnObj[id]);
        }

        window.scrollY = 0;

    }

    static moveSync(noteSync) {
        addOn.endSync(noteSync);
        for (let id in noteSync.addOnObj) {
            noteSync.addOnData[id + 'Map'].forEach(value => {
                if (value.syncStart <= noteSync.currentTime && value.syncEnd > noteSync.currentTime) {
                    addOn.onSymbol(noteSync, value.target);
                    noteSync.addOnObj[id].currentIndex = value.index;
                    noteSync.addOnObj[id].currentSyncStart = value.syncStart;
                    noteSync.addOnObj[id].currentSyncEnd = value.syncEnd;
                }
            });

        }
    }
}