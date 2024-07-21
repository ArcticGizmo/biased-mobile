import { TagId } from './tags';

export type IonicMode = 'md' | 'ios';

export type OptionalFields<T> = {
  [P in keyof T]?: T[P];
};

export type ArtistType = 'group' | 'solo';
export type WhereFrom = 'album' | 'non-album';
export type OwnershipType = 'have' | 'want' | 'in-transit' | 'none';

export interface KPopData {
  packId?: string;
  artist: string;
  artistType: ArtistType;
  groupName?: string;
  //
  whereFrom: WhereFrom;
  whereFromName: string;
  albumVersion?: string;
  year?: string;
  //
  ownershipType: OwnershipType;
  //
  tags: TagId[];
}

export interface KPopCard extends KPopData {
  id: string;
  imageFilePath: string;
}

export interface KPopCardPackable extends KPopData {
  id?: string;
  imageSrc: string;
}
