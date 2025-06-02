import { IsString, IsOptional, IsUUID, IsInt, Min } from "class-validator";

export class CreateTrackDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsUUID("4")
    artistId?: string | null;

    @IsOptional()
    @IsUUID("4")
    albumId?: string | null;

    @IsInt()
    @Min(0)
    duration: number;
}
