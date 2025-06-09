import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller("favs")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    getAll() {
        return this.favoritesService.getAll();
    }

    @Post("track/:id")
    @HttpCode(201)
    addTrack(@Param("id") id: string) {
        return this.favoritesService.addTrack(id);
    }

    @Delete("track/:id")
    @HttpCode(204)
    removeTrack(@Param("id") id: string) {
        return this.favoritesService.removeTrack(id);
    }

    @Post("album/:id")
    @HttpCode(201)
    addAlbum(@Param("id") id: string) {
        return this.favoritesService.addAlbum(id);
    }

    @Delete("album/:id")
    @HttpCode(204)
    removeAlbum(@Param("id") id: string) {
        return this.favoritesService.removeAlbum(id);
    }

    @Post("artist/:id")
    @HttpCode(201)
    addArtist(@Param("id") id: string) {
        return this.favoritesService.addArtist(id);
    }

    @Delete("artist/:id")
    @HttpCode(204)
    removeArtist(@Param("id") id: string) {
        return this.favoritesService.removeArtist(id);
    }
}
