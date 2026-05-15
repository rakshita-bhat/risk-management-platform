import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('risks')
  @ApiOperation({ summary: 'Get risk report data' })
  async getRiskReport(
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.reportsService.generateRiskReport({
      status,
      locationId: locationId ? parseInt(locationId) : undefined,
    });
  }

  @Get('audits')
  @ApiOperation({ summary: 'Get audit report data' })
  async getAuditReport(
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.reportsService.generateAuditReport({
      status,
      locationId: locationId ? parseInt(locationId) : undefined,
    });
  }

  @Get('risks/pdf')
  @ApiOperation({ summary: 'Generate risk PDF report' })
  async generateRiskPDF(
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
    @Res() res?: Response,
  ) {
    const risks = await this.reportsService.generateRiskReport({
      status,
      locationId: locationId ? parseInt(locationId) : undefined,
    });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=risk_report.pdf');
      doc.pipe(res);
    }
    
    doc.fontSize(20).text('Risk Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    if (risks.length === 0) {
      doc.text('No risks found.');
    } else {
      risks.forEach((risk: any, index: number) => {
        doc.fontSize(14).text(`Risk #${index + 1}`);
        doc.fontSize(12).text(`Title: ${risk.title}`);
        doc.text(`Description: ${risk.description || 'N/A'}`);
        doc.text(`Status: ${risk.status}`);
        doc.text(`Location: ${risk.location?.name || 'N/A'}`);
        doc.text(`Created: ${new Date(risk.createdAt).toLocaleDateString()}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  }

  @Get('audits/pdf')
  @ApiOperation({ summary: 'Generate audit PDF report' })
  async generateAuditPDF(
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
    @Res() res?: Response,
  ) {
    const audits = await this.reportsService.generateAuditReport({
      status,
      locationId: locationId ? parseInt(locationId) : undefined,
    });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_report.pdf');
      doc.pipe(res);
    }
    
    doc.fontSize(20).text('Audit Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    if (audits.length === 0) {
      doc.text('No audits found.');
    } else {
      audits.forEach((audit: any, index: number) => {
        doc.fontSize(14).text(`Audit #${index + 1}`);
        doc.fontSize(12).text(`Title: ${audit.title}`);
        doc.text(`Description: ${audit.description || 'N/A'}`);
        doc.text(`Status: ${audit.status}`);
        doc.text(`Location: ${audit.location?.name || 'N/A'}`);
        doc.text(`Auditor: ${audit.auditor ? `${audit.auditor.firstName} ${audit.auditor.lastName}` : 'N/A'}`);
        doc.text(`Created: ${new Date(audit.createdAt).toLocaleDateString()}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  }
}