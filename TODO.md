# TODO

## Image comparer
- set up a server to send base64data and a list of the file locations to compare against
    - use a server so that the model is fast to load
    - should return the confidence back to the caller for each of the images
- if >92 confidence match, display the matches and ask if there is a duplicate
    - this is to help ensure that ids are preserved when updating stuff

## Other
- ability to edit a card
- make backups/imports maintain ownership
- add error handler if google is ever down or has moved
- make google id an environment variable instead
- improve filter swipe across and make it only on the left hand side
- give the with borders prompt for collages a better name
- ability to open collage after it is created (not sure how to open gallery)
- ability to share the collage to friends (if that is even possible)
    - https://ionicframework.com/docs/native/share
- fix collage to split across pages even within the same group (happens for 17 all members for '17 is right here')