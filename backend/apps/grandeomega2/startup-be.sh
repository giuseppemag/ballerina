#! /bin/bash

kill -9 $(lsof -t -i:5000)
ASPNETCORE_ENVIRONMENT=Development dotnet run -- mode web & ASPNETCORE_ENVIRONMENT=Development dotnet run -- mode jobs
