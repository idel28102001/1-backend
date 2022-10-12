import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidateService } from '../services/validate.service';

@Injectable()
export class EmailUniquePipe implements PipeTransform {
  constructor(private readonly validateService: ValidateService) {}

  async transform(dto) {
    if (dto.email) {
      await this.validateService.checkExistEmail(dto.email);
    }
    return dto;
  }
}
