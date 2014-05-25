#!/bin/bash

files() {
  echo ./manifest.json
  find . \
  | egrep '\.(css|html|js|png)$' \
  | egrep -v 'screenshot/'
}

main() {
  rm -f extension.zip
  files \
  | zip -9 -v -@ -o extension.zip
}

main "$@"; exit
