import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Album } from './album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from "./dto/update-album.dto";
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class AlbumService {
    constructor(
        @InjectRepository(Album)
        private albumRepository: Repository<Album>,
        @Inject(forwardRef(() => TrackService)) private trackService: TrackService,
        @Inject(forwardRef(() => FavoritesService))
        private favoritesService: FavoritesService,
    ) {}

    async getAll(): Promise<Album[]> {
        return this.albumRepository.find();
    }

    async getById(id: string): Promise<Album> {
        this.validateUUID(id);
        const album = await this.albumRepository.findOne({ where: { id } });
        if (!album) throw new NotFoundException("Album not found");
        return album;
    }

    async create(dto: CreateAlbumDto): Promise<Album> {
        if (!dto.name || !dto.year) {
            throw new BadRequestException("Missing required fields");
        }
        const album = this.albumRepository.create({
            name: dto.name,
            year: dto.year,
            artistId: dto.artistId || null,
        });
        return this.albumRepository.save(album);
    }

    async update(id: string, dto: UpdateAlbumDto): Promise<Album> {
        this.validateUUID(id);
        const album = await this.albumRepository.findOne({ where: { id } });
        if (!album) throw new NotFoundException("Album not found");
        if (dto.name !== undefined) album.name = dto.name;
        if (dto.year !== undefined) album.year = dto.year;
        if (dto.artistId !== undefined) album.artistId = dto.artistId;
        return this.albumRepository.save(album);
    }

    async delete(id: string): Promise<void> {
        this.validateUUID(id);
        const result = await this.albumRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException("Album not found");

        // Note: In a real application, you would handle cascading deletes
        // For now, we'll keep it simple and let the database handle constraints
    }

    // Helper method for updating entities (used by artist service)
    async updateEntity(album: Album): Promise<Album> {
        return this.albumRepository.save(album);
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
