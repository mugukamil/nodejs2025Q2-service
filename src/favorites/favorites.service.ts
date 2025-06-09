import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Favorites } from './favorites.entity';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';

export interface FavoritesResponse {
  artists: any[];
  albums: any[];
  tracks: any[];
}

@Injectable()
export class FavoritesService {
    private favorites: Favorites = { artists: [], albums: [], tracks: [] };

    constructor(
        @Inject(forwardRef(() => ArtistService))
        private artistService: ArtistService,
        @Inject(forwardRef(() => AlbumService)) private albumService: AlbumService,
        @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
    ) {}

    getAll(): FavoritesResponse {
        const artists = this.favorites.artists
            .map((id) => {
                try {
                    return this.artistService.getById(id);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
        const albums = this.favorites.albums
            .map((id) => {
                try {
                    return this.albumService.getById(id);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
        const tracks = this.favorites.tracks
            .map((id) => {
                try {
                    return this.trackService.getById(id);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
        return { artists, albums, tracks };
    }

    addTrack(id: string) {
        this.validateUUID(id);
        try {
            this.trackService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Track does not exist");
        }
        if (this.favorites.tracks.includes(id)) return;
        // Existence check should be done in controller/service composition
        this.favorites.tracks.push(id);
    }

    removeTrack(id: string, silent = false) {
        this.validateUUID(id);
        const idx = this.favorites.tracks.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Track is not favorite");
            return;
        }
        this.favorites.tracks.splice(idx, 1);
    }

    addAlbum(id: string) {
        this.validateUUID(id);
        try {
            this.albumService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Album does not exist");
        }
        if (this.favorites.albums.includes(id)) return;
        this.favorites.albums.push(id);
    }

    removeAlbum(id: string, silent = false) {
        this.validateUUID(id);
        const idx = this.favorites.albums.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Album is not favorite");
            return;
        }
        this.favorites.albums.splice(idx, 1);
    }

    addArtist(id: string) {
        this.validateUUID(id);
        try {
            this.artistService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Artist does not exist");
        }
        if (this.favorites.artists.includes(id)) return;
        this.favorites.artists.push(id);
    }

    removeArtist(id: string, silent = false) {
        this.validateUUID(id);
        const idx = this.favorites.artists.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Artist is not favorite");
            return;
        }
        this.favorites.artists.splice(idx, 1);
    }

    private validateUUID(id: string) {
        if (
            !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(
                id,
            )
        ) {
            throw new BadRequestException("Invalid UUID");
        }
    }
}
