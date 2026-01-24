import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';

import { Notification } from '@modules/shared/domain/entities/notification.entity';
import type { NotificationRepositoryInterface } from '@modules/notification/domain/repositories/notification.repository.interface';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = this.notificationRepository.create(notification);
    return this.notificationRepository.save(newNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notificationRepository.findOneBy({ _id: new ObjectId(id) });
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }
}
