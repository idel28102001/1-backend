import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateBotDto } from '../dto/create.bot.dto';
import { BotsService } from '../services/bots.service';
import { JwtRequest } from '../../auth/interfaces/jwt.request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Bot } from '../entities/bot.entity';
import { UpdateBotDto } from '../dto/update.bot.dto';

@ApiTags('Bots')
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @ApiCreatedResponse({ type: Bot })
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addBot(@Body() dto: CreateBotDto, @Req() req: JwtRequest) {
    return this.botsService.create(req.user.phone, dto);
  }

  @ApiOkResponse({ type: Bot })
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async update(@Body() dto: UpdateBotDto, @Req() req: JwtRequest) {
    return this.botsService.update(req.user.phone, dto);
  }
}
