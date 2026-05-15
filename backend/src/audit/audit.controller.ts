import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('audits')
@Controller('audits')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new audit' })
  @ApiResponse({ status: 201, description: 'Audit created' })
  create(@Body() createAuditDto: {
    title: string;
    description: string;
    auditorId: number;
    locationId?: number;
    status?: string;
  }) {
    return this.auditService.create(createAuditDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all audits' })
  @ApiResponse({ status: 200, description: 'Audits retrieved' })
  findAll(
    @Query('status') status?: string,
    @Query('auditorId') auditorId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.auditService.findAll({
      status,
      auditorId: auditorId ? parseInt(auditorId) : undefined,
      locationId: locationId ? parseInt(locationId) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit by ID' })
  @ApiResponse({ status: 200, description: 'Audit retrieved' })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update audit' })
  @ApiResponse({ status: 200, description: 'Audit updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: {
      title?: string;
      description?: string;
      status?: string;
      auditorId?: number;
      locationId?: number;
    },
  ) {
    return this.auditService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete audit' })
  @ApiResponse({ status: 200, description: 'Audit deleted' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.delete(id);
  }
}