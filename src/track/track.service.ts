import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Track } from "./track.entity";
import { CreateTrackDto } from "./dto/create-track.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { randomUUID } from "crypto";

@Injectable()
export class TrackService {
    private tracks: Track[] = [];

    getAll(): Track[] {
        return this.tracks;
    }

    getById(id: string): Track {
        this.validateUUID(id);
        const track = this.tracks.find((t) => t.id === id);
        if (!track) throw new NotFoundException("Track not found");
        return track;
    }

    create(dto: CreateTrackDto): Track {
        if (!dto.name || typeof dto.duration !== "number") {
            throw new BadRequestException("Missing required fields");
        }
        const track: Track = {
            id: randomUUID(),
            name: dto.name,
            artistId: dto.artistId ?? null,
            albumId: dto.albumId ?? null,
            duration: dto.duration,
        };
        this.tracks.push(track);
        return track;
    }

    update(id: string, dto: UpdateTrackDto): Track {
        this.validateUUID(id);
        const track = this.tracks.find((t) => t.id === id);
        if (!track) throw new NotFoundException("Track not found");
        if (dto.name !== undefined) track.name = dto.name;
        if (dto.artistId !== undefined) track.artistId = dto.artistId;
        if (dto.albumId !== undefined) track.albumId = dto.albumId;
        if (dto.duration !== undefined) track.duration = dto.duration;
        return track;
    }

    delete(id: string): void {
        this.validateUUID(id);
        const idx = this.tracks.findIndex((t) => t.id === id);
        if (idx === -1) throw new NotFoundException("Track not found");
        this.tracks.splice(idx, 1);
    }

    private validateUUID(id: string) {
        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new BadRequestException("Invalid UUID");
        }
    }
}
