import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Album } from './album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { randomUUID } from 'crypto';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class AlbumService {
  private albums: Album[] = [];

  constructor(
    @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
  ) {}

  getAll(): Album[] {
    return this.albums;
  }

  getById(id: string): Album {
    this.validateUUID(id);
    const album = this.albums.find((a) => a.id === id);
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  create(dto: CreateAlbumDto): Album {
    if (!dto.name || typeof dto.year !== 'number') {
      throw new BadRequestException('Missing required fields');
    }
    const album: Album = {
      id: randomUUID(),
      name: dto.name,
      year: dto.year,
      artistId: dto.artistId ?? null,
    };
    this.albums.push(album);
    return album;
  }

  update(id: string, dto: UpdateAlbumDto): Album {
    this.validateUUID(id);
    const album = this.albums.find((a) => a.id === id);
    if (!album) throw new NotFoundException('Album not found');
    if (dto.name !== undefined) album.name = dto.name;
    if (dto.year !== undefined) album.year = dto.year;
    if (dto.artistId !== undefined) album.artistId = dto.artistId;
    return album;
  }

  delete(id: string): void {
    this.validateUUID(id);
    const idx = this.albums.findIndex((a) => a.id === id);
    if (idx === -1) throw new NotFoundException('Album not found');
    // Remove albumId from tracks
    this.trackService.getAll().forEach((track) => {
      if (track.albumId === id) track.albumId = null;
    });
    // Remove from favorites
    this.favoritesService.removeAlbum(id);
    this.albums.splice(idx, 1);
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
