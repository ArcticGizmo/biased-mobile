import {
  membership,
  broadcast,
  calendar,
  calendarStar,
  storefront,
  emailHeartOpen,
  clover,
  torch,
  mapMarkerQuestion,
  starBox
} from '@/icons';

export const TAGS = [
  {
    id: 'pre-order-benefit',
    text: 'POB',
    icon: calendarStar
  },
  {
    id: 'weverse',
    text: 'Weverse',
    icon: starBox
  },
  {
    id: 'broadcast',
    text: 'Broadcast',
    icon: broadcast
  },
  {
    id: 'event',
    text: 'Event',
    icon: calendar
  },
  {
    id: 'seasons-greetings',
    text: 'Seasons Greetings',
    icon: emailHeartOpen
  },
  {
    id: 'membership',
    text: 'Membership',
    icon: membership
  },
  {
    id: 'pop-up',
    text: 'Popup',
    icon: storefront
  },
  {
    id: 'luckydraw',
    text: 'Luckydraw',
    icon: clover
  },
  {
    id: 'lightstick',
    text: 'Lightstick',
    icon: torch
  },
  {
    id: 'other',
    text: 'Other',
    icon: mapMarkerQuestion
  }
] as const;

export type TagId = (typeof TAGS)[number]['id'];

export const getFilteredTags = (tagIds: TagId[]) => TAGS.filter(t => tagIds.includes(t.id));
