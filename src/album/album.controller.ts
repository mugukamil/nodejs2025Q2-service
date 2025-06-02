import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { AlbumService } from "./album.service";
import { CreateAlbumDto } from "./dto/create-album.dto";
import { UpdateAlbumDto } from "./dto/update-album.dto";

@Controller("album")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AlbumController {
    constructor(private readonly albumService: AlbumService) {}

    @Get()
    getAll() {
        return this.albumService.getAll();
    }

    @Get(":id")
    getById(@Param("id") id: string) {
        return this.albumService.getById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createAlbumDto: CreateAlbumDto) {
        return this.albumService.create(createAlbumDto);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
        return this.albumService.update(id, updateAlbumDto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param("id") id: string) {
        return this.albumService.delete(id);
    }
}
