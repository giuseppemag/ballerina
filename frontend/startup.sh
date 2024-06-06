#! /bin/bash

(cd core; yarn; yarn tsc) & (cd tools/create-domain; yarn; yarn tsc)
(cd playground; npm link ../core; yarn)
(cd playground; yarn dev) #(yarn dev & yarn tsc -w))

