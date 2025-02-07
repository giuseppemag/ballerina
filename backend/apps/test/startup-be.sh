#! /bin/bash

kill -9 $(lsof -t -i:5000)
ASPNETCORE_ENVIRONMENT=Development dotnet run -- web & ASPNETCORE_ENVIRONMENT=Development dotnet run -- jobs
