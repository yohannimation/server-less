import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [PrismaModule, FileModule, AnalysisModule],
})
export class AppModule {}
