import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new location' })
  @ApiResponse({ status: 201, description: 'Location created' })
  create(@Body() createLocationDto: { name: string; description?: string; parentId?: number }) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved' })
  findAll() {
    return this.locationService.findAll();
  }

  @Get('tree')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get locations as tree' })
  @ApiResponse({ status: 200, description: 'Location tree retrieved' })
  getTree() {
    return this.locationService.getTree();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location retrieved' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update location' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { name?: string; description?: string; parentId?: number },
  ) {
    return this.locationService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete location' })
  @ApiResponse({ status: 200, description: 'Location deleted' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.delete(id);
  }
}