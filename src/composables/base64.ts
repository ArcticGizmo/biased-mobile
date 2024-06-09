import Compressor from 'compressorjs';

export type ImageFormat = 'png' | 'jpeg';

export type CompressOptions = Pick<Compressor.Options, 'strict' | 'maxWidth' | 'maxHeight' | 'quality'>;

const ensureFormat = (format: string) => {
  if (['png', 'jpeg'].includes(format)) {
    return format as ImageFormat;
  }

  throw 'invalid format';
};

const createBase64UriFromParts = (data: string, format: string) => {
  return `data:image/${ensureFormat(format)};base64,${data}`;
};

const b64toBlob = (b64Data: string, contentType: string, sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export class Base64Uri {
  private _base64Uri: string;

  private constructor(base64Uri: string) {
    if (!base64Uri.startsWith('data:')) {
      throw "data must be of format 'data:{mime};base64,{data}'";
    }
    this._base64Uri = base64Uri;
  }

  async compress(opts: CompressOptions) {
    const resp: Blob = await new Promise((resolve, reject) => {
      new Compressor(this.toBlob(), {
        ...opts,
        success: resolve,
        error: reject,
        mimeType: 'image/jpeg'
      });
    });

    return Base64Uri.fromBlob(resp);
  }

  toString() {
    return this._base64Uri;
  }

  mimeType() {
    return this._base64Uri.replace('data:', '').split(';')[0];
  }

  type() {
    return ensureFormat(this._base64Uri.replace('data:image/', '').split(';')[0]);
  }

  dataOnly() {
    return this._base64Uri.split(',')[1];
  }

  toBlob() {
    return b64toBlob(this.dataOnly(), this.mimeType());
  }

  static fromUri(base64Uri: string) {
    return new Base64Uri(base64Uri);
  }

  static fromParts(data: string, format: string) {
    return new Base64Uri(createBase64UriFromParts(data, format));
  }

  static async fromBlob(blob: Blob): Promise<Base64Uri> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const dataString = reader.result as string;
        resolve(new Base64Uri(dataString));
      };
      reader.readAsDataURL(blob);
    });
  }
}
