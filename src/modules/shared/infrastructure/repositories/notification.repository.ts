import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';

import { AppError, ErrorType } from '@modules/error/domain/app.error';
import type { NotificationRepositoryInterface } from '@modules/notification/domain/repositories/notification.repository.interface';
import { Notification } from '@modules/shared/domain/entities/notification.entity';

@Injectable()
export class NotificationRepository implements NotificationRepositoryInterface {
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

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId } });
  }

  async update(id: string, notification: Partial<Notification>): Promise<Notification> {
    await this.notificationRepository.update({ _id: new ObjectId(id) }, notification);
    const updated = await this.findById(id);
    if (!updated) {
      throw new AppError({
        type: ErrorType.NOT_FOUND,
        message: 'Notification not found',
        statusCode: 404,
      });
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.notificationRepository.delete({ _id: new ObjectId(id) });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId }, { read: true });
  }
}
