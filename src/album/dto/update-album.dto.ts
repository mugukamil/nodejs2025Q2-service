import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class UpdateAlbumDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    year?: number;

    @IsOptional()
    @IsUUID("4")
    artistId?: string | null;
}
