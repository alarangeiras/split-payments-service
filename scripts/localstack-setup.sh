#!/bin/sh
echo "Initializing localstack topics"

awslocal sns create-topic --name send-notification-event