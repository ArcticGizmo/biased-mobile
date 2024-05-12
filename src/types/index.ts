import { LocalFile } from '@/composables/localFileSystem';

export type OptionalFields<T> = {
  [P in keyof T]?: T[P];
};

export type ArtistType = 'group' | 'solo';
export type WhereFrom = 'album' | 'event';
export type OwnershipType = 'have' | 'want' | 'none';

export interface KPopData {
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
}

export interface KPopCard extends KPopData {
  id: string;
  imageFile: LocalFile; 
}

export interface KPopCardPackable extends KPopData {
  id?: string;
  imageSrc: string;
}
