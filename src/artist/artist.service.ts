import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Artist } from "./artist.entity";
import { CreateArtistDto } from "./dto/create-artist.dto";
import { UpdateArtistDto } from "./dto/update-artist.dto";
import { randomUUID } from "crypto";

@Injectable()
export class ArtistService {
    private artists: Artist[] = [];

    getAll(): Artist[] {
        return this.artists;
    }

    getById(id: string): Artist {
        this.validateUUID(id);
        const artist = this.artists.find((a) => a.id === id);
        if (!artist) throw new NotFoundException("Artist not found");
        return artist;
    }

    create(dto: CreateArtistDto): Artist {
        if (!dto.name || typeof dto.grammy !== "boolean") {
            throw new BadRequestException("Missing required fields");
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
        if (!artist) throw new NotFoundException("Artist not found");
        if (dto.name !== undefined) artist.name = dto.name;
        if (dto.grammy !== undefined) artist.grammy = dto.grammy;
        return artist;
    }

    delete(id: string): void {
        this.validateUUID(id);
        const idx = this.artists.findIndex((a) => a.id === id);
        if (idx === -1) throw new NotFoundException("Artist not found");
        this.artists.splice(idx, 1);
    }

    private validateUUID(id: string) {
        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new BadRequestException("Invalid UUID");
        }
    }
}
