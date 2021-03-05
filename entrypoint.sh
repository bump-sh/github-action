#!/bin/sh -l

# if you want to know why gem install is made in entrypoint.sh instead of Dockerfile,
# please read the discussion here: https://github.com/bump-sh/github-action/pull/2.
cd /home
gem install bump-cli --version "~> 0.7"

$GEM_HOME/bin/bump $1 ${GITHUB_WORKSPACE}/$2 --doc $3 --token $4 --validation $5
