import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { AnalysisService } from '../analysis/analysis.service';

@Module({
  controllers: [FileController],
  providers: [FileService, AnalysisService],
  exports: [FileService],
})
export class FileModule {}
