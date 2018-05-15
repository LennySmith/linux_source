# Overview

This directory holds 2 projects. The first was a project designed to take information currently held in the
`ProjectInformationSQL2` database on `sql2014` and put it into a MongoDB database. The whole purpose of that
is to give me some readily usable information that I would want to be able to search by location on. See [database README]
(database/README.md) for details there.

The second project is an adaptation of a Googls MAPS MEAN example that I found on-line. That is in the front_end
directory, and holds the code that will display the information in the MongoDB database created above.

I am looking for something like a combination of what Cliff has in ArcGIS, with
some better visualization. Let's see what happens. I started this project about
3 weeks ago, spending a few hours here or there when I got the chance.

# Creating The Front End

I started by going through the tutorial here [Create a MEAN App Called CodePost](https://coursetro.com/courses/13/Create-a-MEAN-App-Called-CodePost---Full-Stack).

I had purchased a membership here, figured I could use it for many other things.

## Install the Angular CLI

I had already installed node, npm and the Angular CLI. The video shows you how,
they aren't tough installs, so I will leave that noise out.

## Intialize The Front End

Given that I had already installed everything, I created the new front end for
the project by first making sure I was in this top-level directory, then typing
the command `ng new front-end --routing --style=scss`. I find it interesting that they don't allow
underscores in project names. This provides the basic routing scaffolding, and
adds SASS for the CSS functionality.

This can take a little bit, so be patient. Take it as a plus that you won't have
to create all of this by hand. Think of it like a Visual Studio project. It all
works. If you really want to test, just enter the command `ng serve` at the command
line, and then open up a browser to `http://localhost:4200` and you should see your
newly generated app.

Another thing to note. This gives you Typescript as a language for a lot of things.
No big deal, really, just another language. This tutorial will help.

## Install Express And Body-Parser

These 2 are needed to implement the E in the MEAN stack. I will be using JSON
as my language of choice for the back and forth communications. Do this with the
command `npm install --save express body-parser`. The `--save` will save the
dependencies for when you do a clean or re-build.

## Install The MongoDB Client

This is needed to talk to the DB via node. I tried Mongoose, but that was really unwieldy. Had
to declare schemas and all other kinds of things to get it to work. Way too much overhead to
just return the fields from the db. Install via `npm install --save mongodb`.

# Start Putting the Server Together

First thing is to create a `server.js` file right at the root level. I went through
the tutorial, so a lot of the things from the tutorial are already there.

# The api.js File

This is the routes to get to the database. If we end up having interfaces to a lot
of endpoints, we probably want to put more files in here than this single API point. Mine also deviates from the tutorial in that I have a construction database
already in place.

## Getting General Project Information

I have two entry points at this time. One gives me the whole set of project information, and the other
returns a set of top-level information bullets for all the projects within a given lat long box.

# Links

[Express Routing](https://expressjs.com/en/guide/routing.html)

[Visualizing Data In Google Maps](https://developers.google.com/maps/documentation/javascript/earthquakes#circle_size)