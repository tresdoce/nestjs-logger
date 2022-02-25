import { BadRequestException, Controller, Get, InternalServerErrorException } from '@nestjs/common';

/**
 * Controller: /test-app
 */
@Controller('test-app')
export class AppController {
  /**
   * Fetching cats ok
   */
  @Get('ok')
  public ok(): string {
    return 'This action returns all cats';
  }
  /**
   * Fetching bad request
   */
  @Get('badRequest')
  public badRequest(): string {
    throw new BadRequestException();
  }
}
