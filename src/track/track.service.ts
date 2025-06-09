import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Track } from './track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from "./dto/update-track.dto";
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class TrackService {
    constructor(
        @InjectRepository(Track)
        private trackRepository: Repository<Track>,
        @Inject(forwardRef(() => FavoritesService))
        private favoritesService: FavoritesService,
    ) {}

    async getAll(): Promise<Track[]> {
        return this.trackRepository.find();
    }

    async getById(id: string): Promise<Track> {
        this.validateUUID(id);
        const track = await this.trackRepository.findOne({ where: { id } });
        if (!track) throw new NotFoundException("Track not found");
        return track;
    }

    async create(dto: CreateTrackDto): Promise<Track> {
        if (!dto.name || !dto.duration) {
            throw new BadRequestException("Missing required fields");
        }
        const track = this.trackRepository.create({
            name: dto.name,
            duration: dto.duration,
            artistId: dto.artistId || null,
            albumId: dto.albumId || null,
        });
        return this.trackRepository.save(track);
    }

    async update(id: string, dto: UpdateTrackDto): Promise<Track> {
        this.validateUUID(id);
        const track = await this.trackRepository.findOne({ where: { id } });
        if (!track) throw new NotFoundException("Track not found");
        if (dto.name !== undefined) track.name = dto.name;
        if (dto.duration !== undefined) track.duration = dto.duration;
        if (dto.artistId !== undefined) track.artistId = dto.artistId;
        if (dto.albumId !== undefined) track.albumId = dto.albumId;
        return this.trackRepository.save(track);
    }

    async delete(id: string): Promise<void> {
        this.validateUUID(id);
        const result = await this.trackRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException("Track not found");

        // Note: In a real application, you would handle cascading deletes
        // For now, we'll keep it simple and let the database handle constraints
    }

    // Helper method for updating entities (used by artist service)
    async updateEntity(track: Track): Promise<Track> {
        return this.trackRepository.save(track);
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
