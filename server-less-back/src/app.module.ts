import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, FileModule],
})
export class AppModule {}
