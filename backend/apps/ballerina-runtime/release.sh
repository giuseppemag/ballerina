#!/bin/bash

dotnet fantomas ../../
cd ../automatic-tests
dotnet test
retVal=$?
if [ $retVal -eq 0 ]; then
  echo "Test successful, releasing."
  cd ../ballerina-runtime
  dotnet publish --runtime osx-x64 --self-contained
  zip -r ballerina-runtime.osx-x64.zip ./bin/Release/net9.0/osx-x64/publish
  dotnet publish --runtime win-x64 --self-contained
  zip -r ballerina-runtime.win-x64.zip ./bin/Release/net9.0/win-x64/publish
  dotnet publish --runtime linux-x64 --self-contained
  zip -r ballerina-runtime.linux-x64.zip ./bin/Release/net9.0/linux-x64/publish
  gh release delete latest -y --cleanup-tag
  gh release create --latest "latest" -n "Latest release of the Ballerina 🩰 runtime." ballerina-runtime.osx-x64.zip ballerina-runtime.win-x64.zip ballerina-runtime.linux-x64.zip
  rm ballerina-runtime.osx-x64.zip
  rm ballerina-runtime.win-x64.zip
  rm ballerina-runtime.linux-x64.zip
else
  echo "Aborting release: tests failed."
fi