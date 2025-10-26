#!/bin/sh
  
while ! curl -s http://localhost:4567/_localstack/health | grep -q '"sns": "running"'; do
    echo "Waiting for LocalStack to be healthy..."
    sleep 5
done
echo "LocalStack is healthy."