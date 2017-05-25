#!/bin/bash
echo "{\"disk.capacity\":`df -k . | awk '{printf "%.d\n", $2 * 1024 }' | tail -1`,
\"disk.usage\":`df -k . | awk '{ printf "%.d\n", $3 * 1024 }' | tail -1` }"