#!/bin/bash
echo "{ \"cpu.load\":`uptime | sed 's/, / /g' | sed 's/,/./g' | sed 's/.*averages\{0,1\}: \([0-9\.]*\).*/\1/g'` }"
