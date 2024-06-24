# baised
keep track of our kpop addiction

# Installation
- install ionic cli `npm install -g @ionic/cli
- install jdk 17
- install android (https://gist.github.com/ArcticGizmo/2d772424b16908117fbf49e209ea40d0)

# Android - Live Realoading
for android, you are going to want to first run
```
adb start-server
adb reverse tcp:8100 tcp:8100
```
so that it can correctly communicate to the emulator