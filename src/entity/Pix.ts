import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Pix {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(()=> User, user => user.id)
    @JoinColumn()
    requestingUser: User;

    @ManyToOne(()=> User, user => user.id, {nullable: true})
    @JoinColumn()
    payingUser: User;


    @Column()
    status: string;

    @Column()
    value: number;

    @CreateDateColumn()
    createdAt: Date;

    
    @UpdateDateColumn()
    updatedAt: Date;
}