#! /bin/bash

# NODE_ENV should be either 'production' or 'development'
if [ -n "$NODE_ENV" ]; then
  # we are running in docker
  echo " * Seeding in docker mode"
  data_dir="/initial_data"
  host="mongodb"
else
  # we are running locally
  echo " * Seeding in local mode"
  data_dir="."
  host="localhost"
fi

echo " * Dropping existing DB"
drop="mongo --host $host ecovenga --eval 'db.dropDatabase()'"
eval $drop

echo " * Importing default users"
mongoimport --host "$host" --db ecovenga --collection users --type json --file "$data_dir/users.json" --jsonArray

if [ -n "$NODE_ENV" ] && [ "$NODE_ENV" == "production" ]; then
  echo " * Not importing events and items"
  exit 0
fi

echo " * Importing events and items"
mongoimport --host "$host" --db ecovenga --collection events --type json --file "$data_dir/events.json" --jsonArray
mongoimport --host "$host" --db ecovenga --collection items --type json --file "$data_dir/items.json" --jsonArray
