import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    constructor(
        @InjectRepository(Favorites)
        private favoritesRepository: Repository<Favorites>,
        @Inject(forwardRef(() => ArtistService))
        private artistService: ArtistService,
        @Inject(forwardRef(() => AlbumService)) private albumService: AlbumService,
        @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
    ) {}

    async getAll(): Promise<FavoritesResponse> {
        const favorites = await this.getOrCreateFavorites();
        const artists = [];
        const albums = [];
        const tracks = [];

        // Get artist details
        for (const artistId of favorites.artists) {
            try {
                const artist = await this.artistService.getById(artistId);
                artists.push(artist);
            } catch {
                // Artist might have been deleted, skip
            }
        }

        // Get album details
        for (const albumId of favorites.albums) {
            try {
                const album = await this.albumService.getById(albumId);
                albums.push(album);
            } catch {
                // Album might have been deleted, skip
            }
        }

        // Get track details
        for (const trackId of favorites.tracks) {
            try {
                const track = await this.trackService.getById(trackId);
                tracks.push(track);
            } catch {
                // Track might have been deleted, skip
            }
        }

        return { artists, albums, tracks };
    }

    async addTrack(id: string): Promise<void> {
        this.validateUUID(id);
        try {
            await this.trackService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Track does not exist");
        }

        const favorites = await this.getOrCreateFavorites();
        if (favorites.tracks.includes(id)) return;

        favorites.tracks.push(id);
        await this.favoritesRepository.save(favorites);
    }

    async removeTrack(id: string, silent = false): Promise<void> {
        this.validateUUID(id);
        const favorites = await this.getOrCreateFavorites();
        const idx = favorites.tracks.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Track is not favorite");
            return;
        }
        favorites.tracks.splice(idx, 1);
        await this.favoritesRepository.save(favorites);
    }

    async addAlbum(id: string): Promise<void> {
        this.validateUUID(id);
        try {
            await this.albumService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Album does not exist");
        }

        const favorites = await this.getOrCreateFavorites();
        if (favorites.albums.includes(id)) return;

        favorites.albums.push(id);
        await this.favoritesRepository.save(favorites);
    }

    async removeAlbum(id: string, silent = false): Promise<void> {
        this.validateUUID(id);
        const favorites = await this.getOrCreateFavorites();
        const idx = favorites.albums.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Album is not favorite");
            return;
        }
        favorites.albums.splice(idx, 1);
        await this.favoritesRepository.save(favorites);
    }

    async addArtist(id: string): Promise<void> {
        this.validateUUID(id);
        try {
            await this.artistService.getById(id);
        } catch {
            throw new UnprocessableEntityException("Artist does not exist");
        }

        const favorites = await this.getOrCreateFavorites();
        if (favorites.artists.includes(id)) return;

        favorites.artists.push(id);
        await this.favoritesRepository.save(favorites);
    }

    async removeArtist(id: string, silent = false): Promise<void> {
        this.validateUUID(id);
        const favorites = await this.getOrCreateFavorites();
        const idx = favorites.artists.indexOf(id);
        if (idx === -1) {
            if (!silent) throw new NotFoundException("Artist is not favorite");
            return;
        }
        favorites.artists.splice(idx, 1);
        await this.favoritesRepository.save(favorites);
    }

    private async getOrCreateFavorites(): Promise<Favorites> {
        let favorites = await this.favoritesRepository.findOne({ where: { id: 1 } });
        if (!favorites) {
            favorites = this.favoritesRepository.create({
                id: 1,
                artists: [],
                albums: [],
                tracks: [],
            });
            favorites = await this.favoritesRepository.save(favorites);
        }
        return favorites;
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
