import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { Favorites } from "./favorites.entity";

@Injectable()
export class FavoritesService {
    private favorites: Favorites = { artists: [], albums: [], tracks: [] };

    getAll() {
        // In a real app, you would fetch full entities. Here, just return IDs for now.
        return this.favorites;
    }

    addTrack(id: string) {
        this.validateUUID(id);
        if (this.favorites.tracks.includes(id)) return;
        // Existence check should be done in controller/service composition
        this.favorites.tracks.push(id);
    }

    removeTrack(id: string) {
        this.validateUUID(id);
        const idx = this.favorites.tracks.indexOf(id);
        if (idx === -1) throw new NotFoundException("Track is not favorite");
        this.favorites.tracks.splice(idx, 1);
    }

    addAlbum(id: string) {
        this.validateUUID(id);
        if (this.favorites.albums.includes(id)) return;
        this.favorites.albums.push(id);
    }

    removeAlbum(id: string) {
        this.validateUUID(id);
        const idx = this.favorites.albums.indexOf(id);
        if (idx === -1) throw new NotFoundException("Album is not favorite");
        this.favorites.albums.splice(idx, 1);
    }

    addArtist(id: string) {
        this.validateUUID(id);
        if (this.favorites.artists.includes(id)) return;
        this.favorites.artists.push(id);
    }

    removeArtist(id: string) {
        this.validateUUID(id);
        const idx = this.favorites.artists.indexOf(id);
        if (idx === -1) throw new NotFoundException("Artist is not favorite");
        this.favorites.artists.splice(idx, 1);
    }

    private validateUUID(id: string) {
        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new BadRequestException("Invalid UUID");
        }
    }
}
