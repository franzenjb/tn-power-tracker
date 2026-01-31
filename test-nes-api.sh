#!/bin/bash

# Test script for NES Outage API
# Usage: ./test-nes-api.sh

API_URL="https://utilisocial.io/datacapable/v2/p/NES/map/events"

echo "====================================="
echo "NES Outage API Test"
echo "====================================="
echo ""

echo "Testing API endpoint: $API_URL"
echo ""

# Test if API is accessible
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✓ API is accessible (HTTP $HTTP_CODE)"
    echo ""

    # Get summary statistics
    echo "Current Outage Statistics:"
    echo "-------------------------"
    curl -s "$API_URL" | jq '{
        total_outages: length,
        total_customers_affected: ([.[] | .numPeople] | add),
        largest_outage: ([.[] | .numPeople] | max),
        average_customers_per_outage: (([.[] | .numPeople] | add) / length | floor)
    }'
    echo ""

    # Show top 5 largest outages
    echo "Top 5 Largest Outages:"
    echo "---------------------"
    curl -s "$API_URL" | jq '[.[] | {customers: .numPeople, location: "\(.latitude),\(.longitude)", identifier: .identifier}] | sort_by(-.customers) | .[0:5]'
    echo ""

    # Show sample record
    echo "Sample Outage Record:"
    echo "--------------------"
    curl -s "$API_URL" | jq '.[0]'

else
    echo "✗ API request failed (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""
echo "====================================="
echo "Test Complete"
echo "====================================="
