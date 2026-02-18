#!/bin/bash
# Test the food-estimate Edge Function. Replace YOUR_ANON_KEY with your key if needed.
ANON_KEY="${1:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbmtlaWJsYnZ5cHp5aGlqcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjU4NzIsImV4cCI6MjA4NzAwMTg3Mn0.GFFcZn2kBCNWhS2THXK_9LP1hOTsQZ7dZmUxvT5JkqE}"
URL="https://pinkeiblbvypzyhijqtk.supabase.co/functions/v1/food-estimate"
echo "Calling food-estimate..."
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"text":"two eggs and toast"}' \
  -w "\n\nHTTP status: %{http_code}\n" \
  --max-time 30
