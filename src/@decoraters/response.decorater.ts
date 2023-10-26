import { SetMetadata, applyDecorators } from '@nestjs/common';

export const ResponseMessage = (
  message: string,
  source?: string[] | string,
): any =>
  applyDecorators(
    SetMetadata('message', message.toLocaleLowerCase()),
    SetMetadata('source', source),
  );
