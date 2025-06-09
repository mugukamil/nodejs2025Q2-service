import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Artist } from '../artist/artist.entity';
import { Album } from '../album/album.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  artistId: string | null;

  @Column({ nullable: true })
  albumId: string | null;

  @Column()
  duration: number;

  @ManyToOne(() => Artist, (artist) => artist.tracks, { nullable: true })
  @JoinColumn({ name: 'artistId' })
  artist?: Artist | null;

  @ManyToOne(() => Album, (album) => album.tracks, { nullable: true })
  @JoinColumn({ name: 'albumId' })
  album?: Album | null;
}
