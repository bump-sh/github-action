#!/bin/sh -l

cd /home
gem install bump-cli
$GEM_HOME/bin/bump $1 ${GITHUB_WORKSPACE}/$2 --id $3 --token $4 --validation $5
