import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RiskStatus } from './entities/risk.entity';

@ApiTags('risks')
@Controller('risks')
export class RiskController {
  constructor(private riskService: RiskService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new risk' })
  @ApiResponse({ status: 201, description: 'Risk created' })
  create(@Body() createRiskDto: {
    title: string;
    description: string;
    locationId?: number;
    assigneeId?: number;
    creatorId: number;
    auditId?: number;
  }) {
    return this.riskService.create(createRiskDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all risks' })
  @ApiResponse({ status: 200, description: 'Risks retrieved' })
  findAll(
    @Query('status') status?: RiskStatus,
    @Query('assigneeId') assigneeId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.riskService.findAll({
      status,
      assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
      locationId: locationId ? parseInt(locationId) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get risk by ID' })
  @ApiResponse({ status: 200, description: 'Risk retrieved' })
  @ApiResponse({ status: 404, description: 'Risk not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.riskService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update risk status' })
  @ApiResponse({ status: 200, description: 'Risk status updated' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: RiskStatus,
  ) {
    return this.riskService.updateStatus(id, status);
  }

  @Put(':id/evidence')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add evidence to risk' })
  @ApiResponse({ status: 200, description: 'Evidence added' })
  addEvidence(
    @Param('id', ParseIntPipe) id: number,
    @Body('evidenceUrls') evidenceUrls: string[],
  ) {
    return this.riskService.addEvidence(id, evidenceUrls);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update risk' })
  @ApiResponse({ status: 200, description: 'Risk updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: {
      title?: string;
      description?: string;
      locationId?: number;
      assigneeId?: number;
      status?: RiskStatus;
    },
  ) {
    return this.riskService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete risk' })
  @ApiResponse({ status: 200, description: 'Risk deleted' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.riskService.delete(id);
  }
}