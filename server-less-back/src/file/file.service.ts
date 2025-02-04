import { Injectable, NotFoundException } from '@nestjs/common';

import { File, FileStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async create(createFileDto: CreateFileDto): Promise<File> {
    return this.prisma.file.create({
      data: {
        filename: createFileDto.filename,
        status: FileStatus.PENDING,
      },
    });
  }

  async findAll(): Promise<File[]> {
    return this.prisma.file.findMany({
      include: {
        results: true,
        notification: true,
      },
    });
  }

  async findOne(id: string): Promise<File> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        results: true,
        notification: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }
  async updateStatus(id: string, status: FileStatus): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data: {
        status,
        analyzedAt: status === FileStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
