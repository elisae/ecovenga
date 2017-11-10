Introduction
------------
This is a university project I'm a *little* more confident showing here, even though it's still a toy project, and incomplete at that. It taught me quite a few things and considering the amount of time spent on this, the outcome is totally fine.

#### The Team
Random set of four third- to seventh-semester students, all of us noobs at most of the technologies used for this project, and only two really contributing.

#### The Task
"Agree on a set of frameworks/technologies from the web ecosphere that are new for you. Pick a random project idea, implement it using these, and learn something."

#### The Stack
We agreed on the classic MEAN stack:
* Database: *MongoDB*
* Server: *Node*, *Express*
* Frontend: *Angular*, *Gulp*, *Sass*, *Foundation*
* Tests: *Mocha*, *Chai*
* Deployment: *Docker Compose*
* Build: *Gulp*

#### The Features
You cannot even create an account yet... But assuming you had one (entered into the database by the initial seeding), then you can log in with your *totally* encrypted password, receive a *totally* secure auth-token, and:
* Create/edit/delete events, invite/disinvite friends, participate in friends' events
* List items that should be brought to the event, take/untake responsibility for items, assign costs to them
* View assigned items of all upcoming events (shopping-list-like)
* Sum up all costs and divide equally between all event participants, retrieve overview of who-owes-whom

#### The Architecture
The most interesting part, for me, is that we used Docker with one container each for the database, the app server, and the initial data seed. The rest is pretty basic, I guess (find out by clicking through the repo.)

#### What I learned
Once again, I was responsible for the backend: development environment, database, API, and all that jazz – alongside with a mini test suite. I also set up an initial scaffold with the basic views and Angular ~~components~~ modules, controllers, whatever, needed for our project. And last but not least I implemented the algorithm to calculate all mutual debts.  
So that's basically my take-away: First experience with **Docker Compose**, **JavaScript testing** and **Angular**, further experience with **NoSQL**, **RESTful API definition** (and **protection**) with Express, and a "revival" of those algorithmic-problem-solving brain cells.

Grade was B+. If you have any questions, let me know.  
<br>
**Disclaimer**  
From here on, everything is as it was when we handed the project in (June '17), including some structural no-goes (in my opinion) that I'm lacking the motivation to fix right now. It may also contain some errors I'm not aware of.

**P.S.:**  
Oh and by the way, the name is partly random, partly cool:
* `eco`: random buzzword as the original team name, when we didn't have a project idea yet
* `venga`: *"¡Venga, venga!"* (Spanish for *"Come on!"*) is something I like to shout out to my mates when setting out for something (e.g. a new web project)
* `co-`: Latin prefix for *"together"*, *"mutually"*
* `e-`: English prefix for anything electronic

`ecovenga`: *"Come together electronically"* ... or something like that :D

---

Ecovenga
========
### App description
Ecovenga is a mobile web app to organize any kind of event. After your login, you have the possibility to create a new event and add a list to it with all the items that have to be bought. You are able to add your friends to the event.
Every member can now add own or choose other items he will bring to the event. In an expenses view, the app computes the different outgoings and displays every member which person he is owing which amount of money and what the others are owing him.

### How to run the app
#### With Docker - Development mode
0. If necessary, run `npm install` first.
1. In one terminal (depending on your OS it needs to be a Docker Quickstart Terminal) run `docker-compose up`.
2. In another one run `gulp`(see below for additional information).
3. Start developing! Gulp/Browsersync will automatically apply frontend changes. For backend changes, restart the app using `docker-compose restart app` (in a third terminal). Reset the database with `docker-compose restart mongo-seed`.

#### With Docker - Production mode
1. Run `gulp` once (i.e. you can `Ctrl+C` as soon as it has reached the `wait` mode).
2. Run `docker-compose -f docker-compose-production.yml up`.
3. Should be running fine.
*Note: Currently we start out with some sample users even in prod mode because there's no registration mechanism yet.*

#### Locally - Development mode
0. If necessary, `npm install`.
1. Start a mongoDB. Either manually or, conveniently, with `npm run pretest`. Don't forget to stop it with `npm run posttest` when done.
2. Go to the `initial_data` directory and run `./seed.sh`. Repeat any time you'd like to reset the database. *Note: This will **not** work if you have **not** `cd`'d into the directory.*
3. Start server with `node server.js local` or `npm run start_local`.
4. Run `gulp` if you're working on the frontend.
5. Use a REST client to access the backend API directly (`localhost:8080/api`). Most routes require an `authToken` header. See `/auth/auth.js` for details.

### Testing
Tests are under `/tests`. We're using the `mocha` framework and the complete test suite can conveniently be run with `npm test`. A prerequisite is that mongoDB is installed on the machine and the binary is findable via `which mongod`. Otherwise the `mongodb-runner` will install mongoDB automatically, and this may mess things up.

### Debugging
Console logs of all containers are printed out. Starting with `app_1` are those of the node server. If needed, you can open a second terminal and run `docker logs -f <container_id>` to see the logs of a single container.

Other useful commands:
 * `Ctrl`+`C`: Shut down all composed containers (services)
 * `docker-compose stop [<service_name>]`: Shut down all or specified service(s)
 * `docker exec -ti <container_id> sh`: Get a shell on a running container
 * `docker-compose up --force-recreate`: Delete old state, start-over new (doesn't rebuild image(s) though)
 * `docker-compose build`: (Re-)Build image(s)
 * `docker-compose ps` / `docker ps`: List running containers
 * `docker inspect <container_id>`: List a bunch of details about container
 * `docker-machine ip`: Show IP address

### Restart
Working on the *frontend* you **don't have to restart** anything. Just refresh your browser page. Maybe force-refresh.

If you make changes in the *backend*, e.g. `server.js`, restart the node container like so:
1. Open a second Docker Quickstart Terminal
2. `docker-compose restart app`  
(`app` being the name we assigned to our Node service (container) in `docker-compose.yml`. If needed, you can also `restart mongodb` etc.  
*Note: This is notably faster than restarting the whole thing.*

### Gulp
To install gulp on your sytem run "npm install -g gulp"
To compile SASS to CSS go to your terminal and enter "gulp". Gulp is a taskrunner, that helps us to organize our build-steps, such as Sass-Compiling or Unit-Testing.
Gulp copies all of our files from dev to public (also known as prod or live).
So our public folder is not part of our git repo anymore. Everytime you checkout from repo, you have to open a terminal, go to the project folder and run "gulp"

### Members
This project was created by Dominik Zinser(dz020), Elisa Erroi (ee014), Benjamin Schmiedel (bs081) und Aaron Traichel (at056).