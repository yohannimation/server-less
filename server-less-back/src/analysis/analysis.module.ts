import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { FileModule } from '../file/file.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [FileModule, PrismaModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
