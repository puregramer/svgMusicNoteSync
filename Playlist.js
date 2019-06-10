import Track from './Track';

export default class Playlist {
    constructor(tracks = [], callBack) {
        this._tracks = [];
        this.addTrackList(tracks, callBack);

        // console.log('~~~~>>> callBack: ', this.callBack);
    }

    get tracks() {
        return this._tracks;
    }

    getTrack(id) {
        const track = this._tracks[id];
        if (!track) {
            throw Error(`-> Track with id=${id} dosen't exist in playlist`);
        }
        return track;
    }

    addTrack(id, src, name = '', callBack) {
        const track = new Track(id, src, name);
        this.tracks.push(track);
        callBack(track);
        return this;
    }

    addTrackList(list, callBack) {
        list.forEach((track, i) => {
            console.log(track);
            if (typeof track === 'string') {
                // console.log('str', track);
                this.addTrack(i, track, '', callBack);
            } else if (typeof track === 'object') {
                const {src, name} = track;
                // console.log('obj', src, name);
                this.addTrack(i, src, name, callBack);
            }
        });
    }
}
