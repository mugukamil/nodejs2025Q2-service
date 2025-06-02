import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { FavoritesService } from "./favorites.service";

@Controller("favs")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    getAll() {
        return this.favoritesService.getAll();
    }

    @Post("track/:id")
    @HttpCode(HttpStatus.CREATED)
    addTrack(@Param("id") id: string) {
        return this.favoritesService.addTrack(id);
    }

    @Delete("track/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    removeTrack(@Param("id") id: string) {
        return this.favoritesService.removeTrack(id);
    }

    @Post("album/:id")
    @HttpCode(HttpStatus.CREATED)
    addAlbum(@Param("id") id: string) {
        return this.favoritesService.addAlbum(id);
    }

    @Delete("album/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    removeAlbum(@Param("id") id: string) {
        return this.favoritesService.removeAlbum(id);
    }

    @Post("artist/:id")
    @HttpCode(HttpStatus.CREATED)
    addArtist(@Param("id") id: string) {
        return this.favoritesService.addArtist(id);
    }

    @Delete("artist/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    removeArtist(@Param("id") id: string) {
        return this.favoritesService.removeArtist(id);
    }
}
