import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Artist } from '../artist/artist.entity';
import { Track } from '../track/track.entity';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column({ nullable: true })
  artistId: string | null;

  @ManyToOne(() => Artist, (artist) => artist.albums, { nullable: true })
  @JoinColumn({ name: 'artistId' })
  artist?: Artist | null;

  @OneToMany(() => Track, (track) => track.album)
  tracks?: Track[];
}
