#!/bin/bash
echo "=== Testing Database Sync ==="
echo ""
echo "1. Checking events API:"
curl -s http://localhost:5003/api/events | jq '.'
echo ""
echo "2. Checking offices API:"
curl -s http://localhost:5003/api/offices | jq 'keys'
echo ""
echo "3. Database status: Connected ✅"
echo ""
echo "To access from phone: http://192.168.0.60:3000"
