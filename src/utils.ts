import { ImageType, AttributesType } from './types';
import TGAImage from './TGAImage';

export function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      const result = fileReader.result as ArrayBuffer;
      resolve(result);
    });

    fileReader.addEventListener('error', reject);

    fileReader.readAsArrayBuffer(file);
  });
}

function capitalize(str: string): string {
  return str.replace(/\b(\w)/g, (_, group1) => {
    return group1.toUpperCase();
  });
}

function getAttributesType(tga: TGAImage) {
  switch (tga.stats.attributesType) {
    case AttributesType.NO_ALPHA_DATA:
      return 'No alpha';
    case AttributesType.UNDEFINED_IGNORED:
      return 'Undefined; ignored';
    case AttributesType.UNDEFINED_RETAINED:
      return 'Undefined; retained';
    case AttributesType.USEFUL_ALPHA_CHANNEL:
      return 'Useful alpha channel';
    case AttributesType.PREMULTIPLIED_ALPHA:
      return 'Premultiplied alpha';
    default:
      return undefined;
  }
}

export function generateImageInformationTable(tga: TGAImage) {
  const stats: any = {
    version: tga.stats.version,
    imageType: capitalize(ImageType[tga.stats.imageType].toLowerCase().replace(/_/g, ' ')),
    xOrigin: tga.stats.xOrigin,
    yOrigin: tga.stats.yOrigin,
    imageWidth: tga.stats.imageWidth,
    imageHeight: tga.stats.imageHeight,
    pixelSize: tga.stats.pixelSize,
    imageDescriptor: tga.stats.imageDescriptor.toString(2).padStart(8, '0'),
    imageIdentificationFieldLength: tga.stats.imageIdentificationFieldLength,
    topToBottom: tga.stats.isTopToBottom(),
    colorMapOrigin: tga.stats.colorMapOrigin,
    colorMapLength: tga.stats.colorMapLength,
    colorMapPixelSize: tga.stats.colorMapPixelSize,
    processingTook: `${tga.stats.duration} ms`,
  };

  const attributesType = getAttributesType(tga);

  if (attributesType) {
    stats.attributesType = attributesType;
  }

  const rows: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(stats)) {
    const firsCharacter = key[0];
    const field = `${firsCharacter.toUpperCase()}${key
      .replace(/(?!\b[A-Z])([A-Z])/g, ' $1')
      .substring(1)}`;

    if (typeof value === 'boolean') {
      rows[field] = value ? 'Yes' : 'No';
      continue;
    }

    rows[field] = value as string;
  }

  return rows;
}
