# Overview

This directory is a project that will take selected information from the ProjectInformationSQL2 database
on SQL2014, and put it into MongoDB. Why? I want to see what I can make available via Google Maps. There
is a Node.js driver for SQL Server available from Microsoft, I am starting there.

# The Node.js SQL Server Driver

The driver is available here:

[Node.js Driver for SQL Server](https://docs.microsoft.com/en-us/sql/connect/node-js/node-js-driver-for-sql-server?view=sql-server-2017)

# Installation

I followed these steps:

    npm init
    npm install tedious

# Getting Started

I used the instructions on this page to see if I could connect:

[Getting Started](http://tediousjs.github.io/tedious/getting-started.html)

I created a file called create_script.js to get started and see what I could pull out of the DB.

# Creating The Data

## The General Project Information

I started by splitting the table up a bit, as there were about 300 columns in it.
To do this, I started by splitting the SQL table into the general information,
dates, and flags (bits set to 1 or 0).

There are 3 scripts that the data. The first is `create_general_projects_script.js`.
That one gets the general project information that isn't dates or flags. The
next 2 are named appropriately for either dates or flags.

These create 3 scripts which can be run in MongoDB using its `load()` function:

    insert_general_projects_script.js
    insert_general_project_dates_script.js
    insert_general_project_flags_script.js

Lastly, there is `merge_script.js`, which gets that lat long values from the AS400,
and fills in the lat long values where it can in the `generalProjects` collection.

## From the AS400

No kidding, there is a Node library out there for this.

When I ran the command `npm install --save node-jt400`, it barfed out with some errors about the JDK
version being off. So I tried these commands:

    yum install -y java-1.8.0-openjdk-devel

Note that this installed the development parts that I needed. The openjdk only package doesn't have the
compiler.

So after that was done, I just installed it using `npm install --save node-jt400`.

Then I tried some things out from this page [node-jt400](https://www.npmjs.com/package/node-jt400),
putting the code into create_merge_script.js.

Then to get the properties updated with their lat, long values, I ran the command `load('merge_script.js')`
from within the mongo shell. This takes a while to run. This ran OK, as I got a `true` at the end.

## Populating The Tables

The scripts above don't need to be run in a certain order, but I recommend to do
it this way:

    mongo // this will get you into the mongodb shell
    > db = connect('127.0.0.1/construction')
    > db.generalProjects.drop()
    > load('insert_general_projects_script.js')
    > load('insert_general_project_dates_script.js')
    > load('insert_general_project_flags_script.js')
    > db.generalProjects.createIndex( { location: "2dsphere" } )

After each index creation, you should see something like this as confirmation:

    {
        "createdCollectionAutomatically" : false,
        "numIndexesBefore" : 1,
        "numIndexesAfter" : 2,
        "ok" : 1
    }

## Testing The Insertion

To test that there are the right insertions in each table, run the following
commands, and you should see `8217` as the number:

    db.generalProjects.count()
    db.generalProjectDates.count()
    db.generalProjectFlags.count()

## Adding the AS400 Information

This assumes that you are already attached to the construction database above.
Then run the command `load('merge_script.js')`.

# Using the `$near` Operator

This was really cool. It uses a format like this:

    {
    <location field>: {
        $near: {
        $geometry: {
            type: "Point" ,
            coordinates: [ <longitude> , <latitude> ]
        },
        $maxDistance: <distance in meters>,
        $minDistance: <distance in meters>
        }
    }
    }

I wrote a query that finds all properties within 5,000 meters of Buffalo in `find_near.js`. Note that
the find in this case didn't automatically print them out, so I had to append the `.forEach(printjson)`
at the end. If all the above went correctly, then then when you type `load('find_near.js')` at the mongo prompt, you will see information getting spit out.

As another test, I ran the command `db.generalProjects.find({ PropertyNo: '1163'}, { _id: 1, PropertyNo: 1, location: 1 })` to see what its lat long values are for all the jobs with a property of 1163.
There are values there, and none of the locations are null, so Viola, this worked.

# Queries

## Distinct And Count

Here is an example of distinct on the `ProjectType` column. Remember, like SSMS, you first have to
connect using something like `db = connect('127.0.0.1/construction')`:

    > db.generalProjects.distinct("ProjectType")
    [ "Tenant", "Civil", null, "Shell", "Hotel", "Site Only" ]
    > db.generalProjects.find({ ProjectType: 'Shell' }).count()
    1068
    > db.generalProjects.find({ ProjectType: 'Tenant' }).count()
    6311
    > db.generalProjects.find({ ProjectType: 'Civil' }).count()
    645
    > db.generalProjects.find({ ProjectType: 'Site Only' }).count()
    2
    > db.generalProjects.find({ ProjectType: null }).count()
    166
