import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AnalysisService } from 'src/analysis/analysis.service';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
          return cb(new Error('Only CSV files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const createFileDto: CreateFileDto = {
      filename: file.filename,
    };
    const createdFile = await this.fileService.create(createFileDto);

    // Déclencher l'analyse de manière asynchrone
    this.analysisService.analyzeFile(createdFile.id).catch((error) => {
      console.error('Error analyzing file:', error);
    });

    return createdFile;
  }

  @Get()
  async findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileService.findOne(id);
  }
}
