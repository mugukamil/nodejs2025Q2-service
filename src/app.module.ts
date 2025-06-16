import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { ArtistModule } from "./artist/artist.module";
import { AlbumModule } from "./album/album.module";
import { TrackModule } from "./track/track.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuardModule } from "./auth/auth-guard.module";
import { User } from "./user/user.entity";
import { Artist } from "./artist/artist.entity";
import { Album } from "./album/album.entity";
import { Track } from "./track/track.entity";
import { Favorites } from "./favorites/favorites.entity";
import { LoggingService } from "./common/logging/logging.service";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("DB_HOST"),
                port: +configService.get<number>("DB_PORT"),
                username: configService.get("DB_USERNAME"),
                password: configService.get("DB_PASSWORD"),
                database: configService.get("DB_DATABASE"),
                entities: [User, Artist, Album, Track, Favorites],
                synchronize: configService.get("DB_SYNCHRONIZE") === "true",
                logging: configService.get("DB_LOGGING") === "true",
                migrations: ["dist/migrations/*.js"],
                migrationsTableName: "migrations",
            }),
            inject: [ConfigService],
        }),
        UserModule,
        ArtistModule,
        AlbumModule,
        TrackModule,
        FavoritesModule,
        AuthModule,
        AuthGuardModule,
    ],
    controllers: [AppController],
    providers: [AppService, LoggingService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes("*");
    }
}
