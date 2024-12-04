#! /bin/bash

kill -9 $(lsof -t -i:5000)
dotnet run -- mode web & dotnet run -- mode jobs
