# TODO

  - create template (for others)
- view list of cards
- add labels
  - album
  - album version
  - year
  - want
  - have
- make the home page save the scroll position when you go back after selecting a PC
- group PCs by either
    - group
    - artist
and make them searchable (fuzzy)
- then inside of that have a filter + search
    - filter can be album (check box), year range, sort order, artist (if more than 1), solo vs group (if more than 1)
    - ownership status 

# Issues

- how do we uniquely identity a specific pc?
- should this data be nested or flat?
  - flat makes it easier to scale
  - nested makes it easier to group?

```javascript
const pc = {
  group: '',
  isSoloist: '',
  artist: '',

  // album or event
  album: '',
  albumVersion: '',
  event: '',
  year: '',

  // picture
  image: '',

  // user data
  want: false,
  have: false
};
```
