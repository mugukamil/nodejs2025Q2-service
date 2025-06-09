import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { Track } from "./track.entity";
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
    imports: [TypeOrmModule.forFeature([Track]), forwardRef(() => FavoritesModule)],
    controllers: [TrackController],
    providers: [TrackService],
    exports: [TrackService],
})
export class TrackModule {}
