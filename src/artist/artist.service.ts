import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @Inject(forwardRef(() => AlbumService)) private albumService: AlbumService,
    @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
  ) {}

  async getAll(): Promise<Artist[]> {
    return this.artistRepository.find();
  }

  async getById(id: string): Promise<Artist> {
    this.validateUUID(id);
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  async create(dto: CreateArtistDto): Promise<Artist> {
    if (!dto.name || typeof dto.grammy !== 'boolean') {
      throw new BadRequestException('Missing required fields');
    }
    const artist = this.artistRepository.create({
      name: dto.name,
      grammy: dto.grammy,
    });
    return this.artistRepository.save(artist);
  }

  async update(id: string, dto: UpdateArtistDto): Promise<Artist> {
    this.validateUUID(id);
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');
    if (dto.name !== undefined) artist.name = dto.name;
    if (dto.grammy !== undefined) artist.grammy = dto.grammy;
    return this.artistRepository.save(artist);
  }

  async delete(id: string): Promise<void> {
    this.validateUUID(id);
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) throw new NotFoundException('Artist not found');

    // Nullify artist references in albums and tracks
    await this.artistRepository.query(
      'UPDATE albums SET "artistId" = NULL WHERE "artistId" = $1',
      [id],
    );
    await this.artistRepository.query(
      'UPDATE tracks SET "artistId" = NULL WHERE "artistId" = $1',
      [id],
    );

    // Remove from favorites
    await this.favoritesService.removeArtist(id, true);

    // Delete the artist
    await this.artistRepository.delete(id);
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
