#!/bin/bash

whoami

BAK=$PWD
cd /home/vitaly/_Bots/FoxyBotJrDiscord

/usr/bin/node ./pong.js

cd $BAK
