import { IsString, IsInt, IsOptional, IsUUID } from "class-validator";

export class CreateAlbumDto {
    @IsString()
    name: string;

    @IsInt()
    year: number;

    @IsOptional()
    @IsUUID("4")
    artistId?: string | null;
}
