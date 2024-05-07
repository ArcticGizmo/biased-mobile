import { LocalFile } from '@/composables/localFileSystem';

export type ArtistType = 'group' | 'solo';
export type WhereFrom = 'album' | 'event';
export type OwnershipType = 'have' | 'want' | 'none';

export interface KPopCard {
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
