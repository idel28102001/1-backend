import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiPayloadTooLargeResponse,
  ApiProperty,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

class ErrorResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;
}

import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export function ApiResponseDecorator(
  statuses: (HttpStatus | { code: HttpStatus; options: ApiResponseOptions })[],
) {
  return applyDecorators(
    ...statuses.map((input) => {
      const statusCode =
        typeof input === 'object' && 'code' in input ? input.code : input;
      const options =
        typeof input === 'object' && 'options' in input ? input.options : {};

      const errorOptions: ApiResponseOptions = {
        type: ErrorResponse,
      };

      switch (statusCode) {
        case HttpStatus.OK:
          return ApiOkResponse(options);
        case HttpStatus.CREATED:
          return ApiCreatedResponse(options);
        case HttpStatus.BAD_REQUEST:
          return ApiBadRequestResponse({ ...errorOptions, ...options });
        case HttpStatus.UNAUTHORIZED:
          return ApiUnauthorizedResponse({ ...errorOptions, ...options });
        case HttpStatus.FORBIDDEN:
          return ApiForbiddenResponse({ ...errorOptions, ...options });
        case HttpStatus.NOT_FOUND:
          return ApiNotFoundResponse({ ...errorOptions, ...options });
        case HttpStatus.CONFLICT:
          return ApiConflictResponse({ ...errorOptions, ...options });
        case HttpStatus.TOO_MANY_REQUESTS:
          return ApiTooManyRequestsResponse({ ...errorOptions, ...options });
        case HttpStatus.PAYLOAD_TOO_LARGE:
          return ApiPayloadTooLargeResponse({ ...errorOptions, ...options });
        case HttpStatus.INTERNAL_SERVER_ERROR:
          return ApiInternalServerErrorResponse({
            ...errorOptions,
            ...options,
          });
        default:
          throw new Error('@ApiResponseDecorator() некорректный code');
      }
    }),
  );
}
