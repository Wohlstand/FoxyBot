#!/bin/bash

whoami

BAK=$PWD
cd /home/vitaly/_Bots/FoxyBotJrDiscord

/usr/bin/node --max-old-space-size=256 ./foxy.js

cd $BAK

