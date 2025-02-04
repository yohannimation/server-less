import { Injectable, Logger } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { FileStatus, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { PrismaService } from '../prisma/prisma.service';
import {
  StatisticsResult,
  AnomaliesResult,
  CSVRow,
} from './analysis.interface';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
  ) {}

  private parseCSV(filePath: string): Promise<CSVRow[]> {
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

    return new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          columns: true,
          delimiter: ',',
          skip_empty_lines: true,
          trim: true,
        },
        (error, data) => {
          if (error) reject(error);
          else {
            const parsedData = data.map((row, index) => {
              // Trouver la colonne Quantité avec toutes les variations possibles
              const quantityKey = Object.keys(row).find((key) =>
                key.replace(/\s+/g, '').toLowerCase().includes('quantit'),
              );

              if (!quantityKey) {
                this.logger.error(
                  `No quantity column found in row ${index + 1}`,
                );
                this.logger.debug('Available columns:', Object.keys(row));
              }

              return {
                ID: parseInt(row.ID),
                Nom: row.Nom,
                Prix: parseFloat(row.Prix),
                Quantité: quantityKey ? parseFloat(row[quantityKey]) : 0,
                Note_Client: parseFloat(row.Note_Client),
              };
            });

            resolve(parsedData);
          }
        },
      );
    });
  }
  async analyzeFile(fileId: string): Promise<void> {
    await this.fileService.updateStatus(fileId, FileStatus.PROCESSING);

    try {
      const file = await this.fileService.findOne(fileId);
      const filePath = path.join(process.cwd(), 'uploads', file.filename);
      const data = await this.parseCSV(filePath);

      const statistics = this.calculateStatistics(data);
      const anomalies = this.detectAnomalies(data);

      const statisticsJson: Prisma.JsonObject = JSON.parse(
        JSON.stringify(statistics),
      );
      const anomaliesJson: Prisma.JsonObject = JSON.parse(
        JSON.stringify(anomalies),
      );

      await this.prisma.analysisResult.create({
        data: {
          fileId,
          statistics: statisticsJson,
          anomalies: anomaliesJson,
        },
      });

      await this.fileService.updateStatus(fileId, FileStatus.COMPLETED);
    } catch (error) {
      this.logger.error(`Error analyzing file ${fileId}: ${error.message}`);
      await this.fileService.updateStatus(fileId, FileStatus.ERROR);
      throw error;
    }
  }

  private calculateStatistics(data: CSVRow[]): StatisticsResult {
    const calculateStats = (values: number[]) => {
      const numbers = values.filter((n) => !isNaN(n) && n !== null);
      if (numbers.length === 0) return { moyenne: 0, mediane: 0, ecartType: 0 };

      const moyenne = Number(
        (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2),
      );
      const sorted = [...numbers].sort((a, b) => a - b);
      const mediane = Number(sorted[Math.floor(sorted.length / 2)].toFixed(2));
      const ecartType = Number(
        Math.sqrt(
          numbers.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) /
            numbers.length,
        ).toFixed(2),
      );

      return { moyenne, mediane, ecartType };
    };

    return {
      prix: calculateStats(data.map((row) => row.Prix)),
      quantite: calculateStats(data.map((row) => row.Quantité)),
      note: calculateStats(data.map((row) => row.Note_Client)),
    };
  }

  private detectAnomalies(data: CSVRow[]): AnomaliesResult {
    const anomalies: AnomaliesResult = {
      prix: [],
      quantite: [],
      note: [],
    };

    data.forEach((row, index) => {
      // Prix (10€ à 500€)
      if (row.Prix < 0) {
        anomalies.prix.push({
          ligne: index + 1,
          valeur: row.Prix,
          raison: 'Prix négatif',
        });
      } else if (row.Prix < 10) {
        anomalies.prix.push({
          ligne: index + 1,
          valeur: row.Prix,
          raison: 'Prix inférieur à 10€',
        });
      } else if (row.Prix > 500) {
        anomalies.prix.push({
          ligne: index + 1,
          valeur: row.Prix,
          raison: 'Prix supérieur à 500€',
        });
      }

      // Quantité
      const qte = row.Quantité;
      if (qte < 0) {
        anomalies.quantite.push({
          ligne: index + 1,
          valeur: qte,
          raison: 'Quantité négative',
        });
      } else if (qte === 0) {
        anomalies.quantite.push({
          ligne: index + 1,
          valeur: qte,
          raison: 'Quantité nulle',
        });
      } else if (qte > 1000) {
        anomalies.quantite.push({
          ligne: index + 1,
          valeur: qte,
          raison: 'Quantité excessivement haute (>1000)',
        });
      }

      // Notes (1.0 à 5.0)
      if (row.Note_Client < 1) {
        anomalies.note.push({
          ligne: index + 1,
          valeur: row.Note_Client,
          raison: 'Note inférieure à 1',
        });
      } else if (row.Note_Client > 5) {
        anomalies.note.push({
          ligne: index + 1,
          valeur: row.Note_Client,
          raison: 'Note supérieure à 5',
        });
      }
    });

    return anomalies;
  }
}
