import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.appService.getLeaderboard();
  }

  @Get('session-state')
  async getSessionState() {
    return this.appService.getSessionState();
  }
}
