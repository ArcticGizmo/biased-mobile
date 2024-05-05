# TODO

- create a group/soloist
  - edit
  - backup
  - create template (for others)
- view list of cards
- add labels
  - album
  - album version
  - year
  - want
  - have

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
