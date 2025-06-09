import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Artist } from './artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { randomUUID } from 'crypto';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class ArtistService {
  private artists: Artist[] = [];

  constructor(
    @Inject(forwardRef(() => AlbumService)) private albumService: AlbumService,
    @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
  ) {}

  getAll(): Artist[] {
    return this.artists;
  }

  getById(id: string): Artist {
    this.validateUUID(id);
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  create(dto: CreateArtistDto): Artist {
    if (!dto.name || typeof dto.grammy !== 'boolean') {
      throw new BadRequestException('Missing required fields');
    }
    const artist: Artist = {
      id: randomUUID(),
      name: dto.name,
      grammy: dto.grammy,
    };
    this.artists.push(artist);
    return artist;
  }

  update(id: string, dto: UpdateArtistDto): Artist {
    this.validateUUID(id);
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) throw new NotFoundException('Artist not found');
    if (dto.name !== undefined) artist.name = dto.name;
    if (dto.grammy !== undefined) artist.grammy = dto.grammy;
    return artist;
  }

  delete(id: string): void {
    this.validateUUID(id);
    const idx = this.artists.findIndex((a) => a.id === id);
    if (idx === -1) throw new NotFoundException('Artist not found');
    // Remove artistId from albums
    this.albumService.getAll().forEach((album) => {
      if (album.artistId === id) album.artistId = null;
    });
    // Remove artistId from tracks
    this.trackService.getAll().forEach((track) => {
      if (track.artistId === id) track.artistId = null;
    });
    // Remove from favorites
    this.favoritesService.removeArtist(id, true);
    this.artists.splice(idx, 1);
  }

  private validateUUID(id: string) {
    if (
      !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(
        id,
      )
    ) {
      throw new BadRequestException('Invalid UUID');
    }
  }
}
