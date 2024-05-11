import { LocalFile } from '@/composables/localFileSystem';

export type OptionalFields<T> = {
  [P in keyof T]?: T[P];
};

export type ArtistType = 'group' | 'solo';
export type WhereFrom = 'album' | 'event';
export type OwnershipType = 'have' | 'want' | 'none';

export interface KPopCard {
  id: string;
  imageFile: LocalFile;
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
