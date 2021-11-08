import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CoreEntity } from '../../core/entities/core.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ type: 'datetime', nullable: true })
  loginedAt: Date;

  // @OneToMany((_type) => Project, (project) => project.user, {
  //   eager: true,
  //   cascade: true,
  // })
  // project: Project[];

  // @ManyToMany((_type) => Game, (game) => game.users, {
  //   cascade: true,
  // })
  // @JoinTable({ name: 'users_goods' })
  // games: Game[];
}