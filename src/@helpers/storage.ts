import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

const limits = {
  fileSize: 1024 * 1024 * 3, // accepts less than or equal to 3 MB
};

const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
    return callback(new BadRequestException('Only image is allowed.'), false);
  }
  callback(null, true);
};

const docFileFilter = (req: any, file: any, callback: any) => {
  //get the file extension
  const fileExtName = extname(file.originalname);

  if (!fileExtName.match(/\.(pdf|doc|docx)$/)) {
    return callback(
      new BadRequestException('Only pdf, doc and docx file is allowed.'),
      false,
    );
  }
  callback(null, true);
};

const filename = (req: any, file: any, callback: any) => {
  const fileExtName = extname(file.originalname);

  callback(null, `${uuid()}${fileExtName}`);
};

export { limits, imageFileFilter, filename, docFileFilter };
