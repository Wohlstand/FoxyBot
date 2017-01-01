#!/bin/bash
if [[ $(screen -ls|grep foxybot) == "" ]]
then
    echo "Bot is not running!"
    exit 1
else
    screen -S foxybot -X quit
    echo "Bot has been stopped"
fi

exit 0

