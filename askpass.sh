#!/bin/sh
case "$1" in *Username*) printf "x-access-token" ;; *) printf "%s" "$GH_PAGES_TOKEN" ;; esac
