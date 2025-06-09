import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./src/user/user.entity";
import { Artist } from "./src/artist/artist.entity";
import { Album } from "./src/album/album.entity";
import { Track } from "./src/track/track.entity";
import { Favorites } from "./src/favorites/favorites.entity";

config();

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "home_library",
    entities: [User, Artist, Album, Track, Favorites],
    migrations: ["src/migrations/*.ts"],
    synchronize: false,
    logging: process.env.DB_LOGGING === "true",
});
