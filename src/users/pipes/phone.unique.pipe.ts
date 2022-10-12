import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidateService } from '../services/validate.service';

@Injectable()
export class PhoneUniquePipe implements PipeTransform {
  constructor(private readonly validateService: ValidateService) {}

  async transform(dto) {
    if (dto.phone) {
      await this.validateService.checkExistingPhone(dto.phone);
    }
    return dto;
  }
}
