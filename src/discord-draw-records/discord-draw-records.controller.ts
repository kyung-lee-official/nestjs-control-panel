import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscordDrawRecordsService } from './discord-draw-records.service';
import { CreateDiscordDrawRecordDto } from './dto/create-discord-draw-record.dto';
import { UpdateDiscordDrawRecordDto } from './dto/update-discord-draw-record.dto';

@Controller('discord-draw-records')
export class DiscordDrawRecordsController {
  constructor(private readonly discordDrawRecordsService: DiscordDrawRecordsService) {}

  @Post()
  create(@Body() createDiscordDrawRecordDto: CreateDiscordDrawRecordDto) {
    return this.discordDrawRecordsService.create(createDiscordDrawRecordDto);
  }

  @Get()
  findAll() {
    return this.discordDrawRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discordDrawRecordsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscordDrawRecordDto: UpdateDiscordDrawRecordDto) {
    return this.discordDrawRecordsService.update(+id, updateDiscordDrawRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discordDrawRecordsService.remove(+id);
  }
}
