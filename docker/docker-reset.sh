#!/bin/bash
sudo aa-remove-unknown
sudo docker stop $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)
sudo apparmor_parser -r /var/lib/snapd/apparmor/profiles/snap*
sudo service docker stop
sudo rm -f /var/lib/docker/network/files/local-kv.db
sudo service docker start

